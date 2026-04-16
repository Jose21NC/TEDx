"use client";
import { useEffect, useState, useRef, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import logoBlack from "../media/logo-black.png";
import logoWhite from "../media/logo-white.png";
import { generateApplicantPDF, generateSponsorPDF } from "../../lib/pdfGenerator";
import { sendNewsletterUpdate, sendStatusChangeEmail } from "../../lib/notifications";
import MobileNav from "../components/MobileNav";

type SponsorAspectMode = "square" | "rectangular";

const SPEAKER_TRASH_COLLECTION = "ponentesTedxTrash";
const SPONSOR_TRASH_COLLECTION = "sponsorsTedxTrash";
const VOLUNTEER_TRASH_COLLECTION = "voluntariosTedxTrash";

async function cropSponsorLogoFile(
  file: File,
  options: { aspectMode: SponsorAspectMode; zoom: number; offsetX: number; offsetY: number },
) {
  const src = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo cargar la imagen para recorte."));
      img.src = src;
    });

    const targetAspect = options.aspectMode === "square" ? 1 : 16 / 9;
    const targetWidth = options.aspectMode === "square" ? 1200 : 1600;
    const targetHeight = Math.round(targetWidth / targetAspect);

    const imageAspect = image.naturalWidth / image.naturalHeight;
    let baseCropWidth = image.naturalWidth;
    let baseCropHeight = image.naturalHeight;
    let baseX = 0;
    let baseY = 0;

    if (imageAspect > targetAspect) {
      baseCropHeight = image.naturalHeight;
      baseCropWidth = baseCropHeight * targetAspect;
      baseX = (image.naturalWidth - baseCropWidth) / 2;
    } else {
      baseCropWidth = image.naturalWidth;
      baseCropHeight = baseCropWidth / targetAspect;
      baseY = (image.naturalHeight - baseCropHeight) / 2;
    }

    const clampedZoom = Math.max(1, Math.min(3, options.zoom));
    const cropWidth = baseCropWidth / clampedZoom;
    const cropHeight = baseCropHeight / clampedZoom;

    const offsetX = Math.max(0, Math.min(100, options.offsetX));
    const offsetY = Math.max(0, Math.min(100, options.offsetY));

    const sourceX = baseX + ((baseCropWidth - cropWidth) * offsetX) / 100;
    const sourceY = baseY + ((baseCropHeight - cropHeight) * offsetY) / 100;

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo inicializar el canvas para recorte.");

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      targetWidth,
      targetHeight,
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("No se pudo generar la imagen recortada."));
            return;
          }
          resolve(result);
        },
        "image/png",
        0.95,
      );
    });

    return blob;
  } finally {
    URL.revokeObjectURL(src);
  }
}


export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const [posts, setPosts] = useState<Array<any>>([]);
  const [sponsors, setSponsors] = useState<Array<any>>([]);
  const [volunteers, setVolunteers] = useState<Array<any>>([]);
  const [activePanel, setActivePanel] = useState<"speakers" | "sponsors" | "volunteers" | "page">("speakers");
  const [loading, setLoading] = useState(true);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);
  const [volunteersLoading, setVolunteersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsorsError, setSponsorsError] = useState<string | null>(null);
  const [volunteersError, setVolunteersError] = useState<string | null>(null);
  const [volunteerPhotoSavingId, setVolunteerPhotoSavingId] = useState<string | null>(null);
  const [volunteerPhotoError, setVolunteerPhotoError] = useState<string>("");
  const [copyNotice, setCopyNotice] = useState("");
  const [volunteerImageViewer, setVolunteerImageViewer] = useState<{ src: string; name: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [statusMenuFor, setStatusMenuFor] = useState<string | null>(null);
  const [cardMenuFor, setCardMenuFor] = useState<{ kind: "speaker" | "sponsor"; id: string } | null>(null);
  const [editingRecord, setEditingRecord] = useState<{ kind: "speaker" | "sponsor"; data: any } | null>(null);
  const [approvingSpeaker, setApprovingSpeaker] = useState<any | null>(null);
  const [approvingSponsor, setApprovingSponsor] = useState<any | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, any>>({});
  const [approvalDraft, setApprovalDraft] = useState<Record<string, any>>({});
  const [approvalPhotoFile, setApprovalPhotoFile] = useState<File | null>(null);
  const [approvalPhotoPreview, setApprovalPhotoPreview] = useState<string>("");
  const [sponsorApprovalDraft, setSponsorApprovalDraft] = useState<Record<string, any>>({});
  const [sponsorLogoFile, setSponsorLogoFile] = useState<File | null>(null);
  const [sponsorLogoPreview, setSponsorLogoPreview] = useState<string>("");
  const [sponsorAspectMode, setSponsorAspectMode] = useState<SponsorAspectMode>("rectangular");
  const [sponsorLogoZoom, setSponsorLogoZoom] = useState(1);
  const [sponsorLogoOffsetX, setSponsorLogoOffsetX] = useState(50);
  const [sponsorLogoOffsetY, setSponsorLogoOffsetY] = useState(50);
  const [sponsorCropEditorOpen, setSponsorCropEditorOpen] = useState(false);
  const [sponsorCropDragState, setSponsorCropDragState] = useState<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  const [expandedVolunteerCards, setExpandedVolunteerCards] = useState<Record<string, boolean>>({});
  const [editError, setEditError] = useState<string>("");
  const [approvalError, setApprovalError] = useState<string>("");
  const [sponsorApprovalError, setSponsorApprovalError] = useState<string>("");
  const [editSaving, setEditSaving] = useState(false);
  const [approvalSaving, setApprovalSaving] = useState(false);
  const [sponsorApprovalSaving, setSponsorApprovalSaving] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterHeadline, setNewsletterHeadline] = useState("Novedades TEDx Avenida Bolivar");
  const [newsletterMessageText, setNewsletterMessageText] = useState("");
  const [newsletterSending, setNewsletterSending] = useState(false);
  const [newsletterFeedback, setNewsletterFeedback] = useState<string>("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);
  const cardMenuRef = useRef<HTMLDivElement | null>(null);

  function clampPercent(value: number) {
    return Math.max(0, Math.min(100, value));
  }

  function resetSponsorCropControls() {
    setSponsorLogoZoom(1);
    setSponsorLogoOffsetX(50);
    setSponsorLogoOffsetY(50);
    setSponsorCropDragState(null);
  }

  function handleSponsorCropPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!sponsorLogoPreview) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setSponsorLogoOffsetX(clampPercent(((event.clientX - rect.left) / rect.width) * 100));
      setSponsorLogoOffsetY(clampPercent(((event.clientY - rect.top) / rect.height) * 100));
    }
    setSponsorCropDragState({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: sponsorLogoOffsetX,
      startOffsetY: sponsorLogoOffsetY,
    });
  }

  function handleSponsorCropPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!sponsorCropDragState || !sponsorLogoPreview || sponsorCropDragState.pointerId !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    setSponsorLogoOffsetX(clampPercent(((event.clientX - rect.left) / rect.width) * 100));
    setSponsorLogoOffsetY(clampPercent(((event.clientY - rect.top) / rect.height) * 100));
  }

  function handleSponsorCropPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (!sponsorCropDragState || sponsorCropDragState.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setSponsorCropDragState(null);
  }

  function handleSponsorCropWheel(event: ReactPointerEvent<HTMLDivElement>) {
    if (!sponsorLogoPreview) return;
    event.preventDefault();
    const delta = event.nativeEvent instanceof WheelEvent ? event.nativeEvent.deltaY : 0;
    const zoomStep = delta > 0 ? -0.08 : 0.08;
    setSponsorLogoZoom((prev) => Math.max(1, Math.min(3, Number((prev + zoomStep).toFixed(2)))));
  }

  // close menu on outside click
  useEffect(() => {
    setMounted(true);
    function onDoc(e: MouseEvent) {
      if (!(e.target instanceof Node)) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
      if (statusMenuRef.current && !statusMenuRef.current.contains(target)) setStatusMenuFor(null);
      if (cardMenuRef.current && !cardMenuRef.current.contains(target)) setCardMenuFor(null);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchPosts() {
      try {
        const firebaseModule = await import("../../lib/firebaseClient");
        const firestore = await import("firebase/firestore");
        const db = firebaseModule.getClientDb();
        const col = firestore.collection(db, "ponentesTedx");
        const snap = await firestore.getDocs(col);
        if (!mounted) return;
        const items: Array<any> = [];
        snap.forEach(doc => items.push({ ...doc.data(), id: doc.id }));
        items.sort((a, b) => {
          const ta = a.createdAt?.seconds ?? 0;
          const tb = b.createdAt?.seconds ?? 0;
          return tb - ta;
        });
        setPosts(items);
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchSponsors() {
      try {
        const firebaseModule = await import("../../lib/firebaseClient");
        const firestore = await import("firebase/firestore");
        const db = firebaseModule.getClientDb();
        const col = firestore.collection(db, "sponsorsTedx");
        const snap = await firestore.getDocs(col);
        if (!mounted) return;
        const items: Array<any> = [];
        snap.forEach(doc => items.push({ ...doc.data(), id: doc.id }));
        items.sort((a, b) => {
          const ta = a.createdAt?.seconds ?? 0;
          const tb = b.createdAt?.seconds ?? 0;
          return tb - ta;
        });
        setSponsors(items);
      } catch (err: any) {
        setSponsorsError(err.message || String(err));
      } finally {
        setSponsorsLoading(false);
      }
    }

    fetchSponsors();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchVolunteers() {
      try {
        const firebaseModule = await import("../../lib/firebaseClient");
        const firestore = await import("firebase/firestore");
        const db = firebaseModule.getClientDb();
        const col = firestore.collection(db, "voluntariosTedx");
        const snap = await firestore.getDocs(col);
        if (!mounted) return;
        const items: Array<any> = [];
        snap.forEach(doc => items.push({ ...doc.data(), id: doc.id }));
        items.sort((a, b) => {
          const ta = a.createdAt?.seconds ?? 0;
          const tb = b.createdAt?.seconds ?? 0;
          return tb - ta;
        });
        setVolunteers(items);
      } catch (err: any) {
        setVolunteersError(err.message || String(err));
      } finally {
        setVolunteersLoading(false);
      }
    }

    fetchVolunteers();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    if (!editingRecord && !approvingSpeaker && !approvingSponsor) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editingRecord, approvingSpeaker, approvingSponsor]);

  useEffect(() => {
    if (!approvalPhotoFile) {
      setApprovalPhotoPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(approvalPhotoFile);
    setApprovalPhotoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [approvalPhotoFile]);

  useEffect(() => {
    if (!sponsorLogoFile) {
      setSponsorLogoPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(sponsorLogoFile);
    setSponsorLogoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [sponsorLogoFile]);

      async function generatePDF(p: any) {
    setProcessing(true);
    await generateApplicantPDF(p, logoBlack.src);
    setProcessing(false);
  }

  async function generateSponsorDoc(sponsor: any) {
    setProcessing(true);
    await generateSponsorPDF(sponsor, logoBlack.src);
    setProcessing(false);
  }

  async function handleSendNewsletterUpdate() {
    const subject = newsletterSubject.trim();
    const headline = newsletterHeadline.trim();
    const messageText = newsletterMessageText.trim();

    if (!subject || !headline || !messageText) {
      setNewsletterFeedback("Completa asunto, titular y mensaje antes de enviar.");
      return;
    }

    setNewsletterSending(true);
    setNewsletterFeedback("");

    try {
      const response = await sendNewsletterUpdate({
        subject,
        headline,
        messageText,
      });
      setNewsletterFeedback(`Actualización enviada. Campaign ID: ${response.campaignId}`);
      setNewsletterMessageText("");
    } catch (error) {
      setNewsletterFeedback(error instanceof Error ? error.message : "No se pudo enviar la actualización.");
    } finally {
      setNewsletterSending(false);
    }
  }

  function formatDate(value: any) {
    if (!value) return "";
    if (typeof value?.toDate === "function") return value.toDate().toLocaleString();
    if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString();
    try { const d = new Date(value); if (!isNaN(d.getTime())) return d.toLocaleString(); } catch {}
    return String(value);
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function selectAll() {
    setSelectedIds(getPanelRecords().map((item) => item.id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function updateStatusForSelected(status: string) {
    if (selectedIds.length === 0) return;
    setProcessing(true);
    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const db = firebaseModule.getClientDb();
      const currentPanel = activePanel;
      const collectionName = getPanelCollectionName(currentPanel);
      const sourceRecords = getPanelRecords(currentPanel);

      for (const id of selectedIds) {
        const docRef = firestore.doc(db, collectionName, id);
        await firestore.updateDoc(docRef, { status });
        const targetRecord = sourceRecords.find((item) => item.id === id);
        const recipientEmail = getRecordEmail(targetRecord, currentPanel);
        if (recipientEmail) {
          try {
            await sendStatusChangeEmail({
              recipientEmail,
              recipientName: getRecordName(targetRecord, currentPanel).trim(),
              source: currentPanel === "sponsors" ? "patrocinios" : currentPanel === "volunteers" ? "voluntariado" : "speakers",
              applicationStatus: status,
              trackingUrl: `${window.location.origin}/status?id=${id}`,
            });
          } catch (mailError) {
            console.error("Error sending bulk status email:", mailError);
          }
        }
      }
      const col = firestore.collection(db, collectionName);
      const snap = await firestore.getDocs(col);
      const items: Array<any> = [];
      snap.forEach(d => items.push({ ...d.data(), id: d.id }));
      items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      if (currentPanel === "sponsors") setSponsors(items);
      else if (currentPanel === "volunteers") setVolunteers(items);
      else setPosts(items);
      clearSelection();
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setProcessing(false);
    }
  }

  async function updateStatusForSingle(id: string, status: string, kind: "speaker" | "sponsor" | "volunteer" = "speaker") {
    setProcessing(true);
    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const db = firebaseModule.getClientDb();
      const collectionName = kind === "speaker" ? "ponentesTedx" : kind === "sponsor" ? "sponsorsTedx" : "voluntariosTedx";
      const docRef = firestore.doc(db, collectionName, id);
      await firestore.updateDoc(docRef, { status });

      const trackingUrl = `${window.location.origin}/status?id=${id}`;
      const source = kind === "speaker" ? "speakers" : kind === "sponsor" ? "patrocinios" : "voluntariado";
      const targetRecord = kind === "speaker"
        ? posts.find((item) => item.id === id)
        : kind === "sponsor"
          ? sponsors.find((item) => item.id === id)
          : volunteers.find((item) => item.id === id);
      const recipientEmail = getRecordEmail(targetRecord, kind === "speaker" ? "speakers" : kind === "sponsor" ? "sponsors" : "volunteers");
      const recipientName = getRecordName(targetRecord, kind === "speaker" ? "speakers" : kind === "sponsor" ? "sponsors" : "volunteers").trim();

      if (recipientEmail) {
        try {
          await sendStatusChangeEmail({
            recipientEmail,
            recipientName,
            source,
            applicationStatus: status,
            trackingUrl,
          });
        } catch (mailError) {
          console.error("Error sending status notification email:", mailError);
        }
      }

      if (kind === "speaker") {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      } else if (kind === "sponsor") {
        setSponsors(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      } else {
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status } : v));
      }
      setStatusMenuFor(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setProcessing(false);
    }
  }

  async function deleteSelected() {
    if (selectedIds.length === 0) return;

    const confirmation = window.prompt(
      `Vas a mover ${selectedIds.length} postulación(es) a la papelera segura.\n\nEscribe ELIMINAR para continuar.`,
    );

    if (confirmation !== "ELIMINAR") return;

    setProcessing(true);
    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const db = firebaseModule.getClientDb();
      const currentPanel = activePanel;
      const collectionName = getPanelCollectionName(currentPanel);
      const trashCollectionName = getPanelTrashCollection(currentPanel);
      const records = getPanelRecords(currentPanel);

      for (const id of selectedIds) {
        const record = records.find((item) => item.id === id);
        if (!record) continue;

        const trashRef = firestore.doc(db, trashCollectionName, id);
        await firestore.setDoc(trashRef, {
          ...record,
          deletedAt: firestore.serverTimestamp(),
          deletedBy: loginEmail.trim() || "admin",
          sourceCollection: collectionName,
          sourceDocId: id,
        });

        const docRef = firestore.doc(db, collectionName, id);
        await firestore.deleteDoc(docRef);
      }

      const col = firestore.collection(db, collectionName);
      const snap = await firestore.getDocs(col);
      const items: Array<any> = [];
      snap.forEach(d => items.push({ ...d.data(), id: d.id }));
      items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      if (currentPanel === "sponsors") setSponsors(items);
      else if (currentPanel === "volunteers") setVolunteers(items);
      else setPosts(items);
      clearSelection();
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setProcessing(false);
    }
  }

  function ensureProtocol(url: string | null | undefined) {
    if (!url) return "#";
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  }

  function getShortLinkLabel(url: string | null | undefined) {
    if (!url) return "Enlace";
    try {
      const normalized = ensureProtocol(url);
      const hostname = new URL(normalized).hostname.replace(/^www\./i, "").toLowerCase();
      if (hostname.includes("instagram.com")) return "Instagram";
      if (hostname.includes("linkedin.com")) return "LinkedIn";
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "YouTube";
      if (hostname.includes("facebook.com")) return "Facebook";
      if (hostname.includes("tiktok.com")) return "TikTok";
      if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "X";
      if (hostname.includes("spotify.com")) return "Spotify";
      const firstToken = hostname.split(".")[0] || "enlace";
      return firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
    } catch {
      return "Enlace";
    }
  }

  function formatSponsorType(value: string | undefined) {
    if (!value) return "—";
    if (value === "efectivo") return "Efectivo";
    if (value === "especie") return "En especie";
    if (value === "personalizado") return "Personalizado";
    return value;
  }

  function getPanelRecords(panel = activePanel) {
    if (panel === "sponsors") return sponsors;
    if (panel === "volunteers") return volunteers;
    return posts;
  }

  function getPanelCollectionName(panel = activePanel) {
    if (panel === "sponsors") return "sponsorsTedx";
    if (panel === "volunteers") return "voluntariosTedx";
    return "ponentesTedx";
  }

  function getPanelTrashCollection(panel = activePanel) {
    if (panel === "sponsors") return SPONSOR_TRASH_COLLECTION;
    if (panel === "volunteers") return VOLUNTEER_TRASH_COLLECTION;
    return SPEAKER_TRASH_COLLECTION;
  }

  function getSelectionSummary(panel = activePanel) {
    if (panel === "sponsors") return "patrocinios seleccionados";
    if (panel === "volunteers") return "voluntarios seleccionados";
    return "postulaciones seleccionadas";
  }

  function getBulkStatusOptions(panel = activePanel) {
    if (panel === "sponsors") return ["Pendiente", "En contacto", "Finalizado", "No aprobado"];
    if (panel === "volunteers") return ["Pendiente", "En revision", "Aprobado", "Rechazado"];
    return ["Pendiente", "Aprobada", "Rechazada", "Reserva"];
  }

  function getRecordName(record: any, panel = activePanel) {
    if (panel === "sponsors") return record?.contactName ?? record?.companyName ?? "Participante";
    if (panel === "volunteers") return record?.fullName ?? "Participante";
    return record?.nombre ?? "Participante";
  }

  function getRecordEmail(record: any, panel = activePanel) {
    if (panel === "sponsors") return record?.email?.trim();
    if (panel === "volunteers") return record?.email?.trim();
    return record?.correo?.trim();
  }

  function normalizeSpeakerStatus(value: string | undefined) {
    if (!value || value === "Sin revisar") return "Pendiente";
    return value;
  }

  function normalizeSponsorStatus(value: string | undefined) {
    if (!value || value === "Sin revisar" || value === "Pendiente") return "Pendiente";
    if (value === "Aprobada") return "Finalizado";
    if (value === "Rechazada") return "No aprobado";
    return value;
  }

  function normalizeVolunteerStatus(value: string | undefined) {
    if (!value || value === "Sin revisar") return "Pendiente";
    if (value === "En revisión") return "En revision";
    if (value === "Aprobada") return "Aprobado";
    if (value === "Rechazada") return "Rechazado";
    return value;
  }

  async function copyEmail(email: string | undefined) {
    const safeEmail = (email || "").trim();
    if (!safeEmail || typeof navigator === "undefined" || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(safeEmail);
      setCopyNotice(`Correo copiado: ${safeEmail}`);
      window.setTimeout(() => setCopyNotice(""), 1800);
    } catch {
      setCopyNotice("No se pudo copiar el correo.");
      window.setTimeout(() => setCopyNotice(""), 1800);
    }
  }

  async function handleVolunteerPhotoUpload(volunteer: any, file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setVolunteerPhotoError("Selecciona una imagen válida (PNG, JPG, WEBP, etc.).");
      return;
    }

    const maxFileSize = 8 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setVolunteerPhotoError("La imagen supera el límite de 8MB. Usa un archivo más liviano.");
      return;
    }

    setVolunteerPhotoSavingId(volunteer.id);
    setVolunteerPhotoError("");

    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const storageModule = await import("firebase/storage");
      const db = firebaseModule.getClientDb();
      const storage = firebaseModule.getClientStorage();

      const safeName = String(volunteer.fullName || "voluntario")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "voluntario";
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const storageRef = storageModule.ref(storage, `volunteer-photos/${volunteer.id}/${Date.now()}_${safeName}.${extension}`);

      await storageModule.uploadBytes(storageRef, file);
      const photoUrl = await storageModule.getDownloadURL(storageRef);

      const docRef = firestore.doc(db, "voluntariosTedx", volunteer.id);
      await firestore.updateDoc(docRef, { photoUrl });

      setVolunteers((prev) => prev.map((item) => (item.id === volunteer.id ? { ...item, photoUrl } : item)));
    } catch (err: any) {
      setVolunteerPhotoError(err.message || String(err));
    } finally {
      setVolunteerPhotoSavingId(null);
    }
  }

  function speakerStatusMeta(value: string | undefined) {
    const status = normalizeSpeakerStatus(value);
    if (status === "Aprobada") return { label: "Aprobada", className: "border-green-300 bg-green-50 text-green-700", dot: "bg-green-500" };
    if (status === "Rechazada") return { label: "Rechazada", className: "border-red-300 bg-red-50 text-[var(--color-ted-red)]", dot: "bg-[var(--color-ted-red)]" };
    if (status === "Reserva") return { label: "Reserva", className: "border-yellow-300 bg-yellow-50 text-yellow-700", dot: "bg-yellow-500" };
    return { label: "Pendiente", className: "border-gray-300 bg-gray-50 text-gray-600", dot: "bg-gray-400" };
  }

  function speakerStatusColor(value: string | undefined) {
    const status = normalizeSpeakerStatus(value);
    if (status === "Aprobada") return "#22c55e";
    if (status === "Rechazada") return "#eb0028";
    if (status === "Reserva") return "#eab308";
    return "#9ca3af";
  }

  function sponsorStatusMeta(value: string | undefined) {
    const status = normalizeSponsorStatus(value);
    if (status === "Finalizado") return { label: "Finalizado", className: "border-emerald-300 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" };
    if (status === "No aprobado") return { label: "No aprobado", className: "border-red-300 bg-red-50 text-[var(--color-ted-red)]", dot: "bg-[var(--color-ted-red)]" };
    if (status === "En contacto") return { label: "En contacto", className: "border-blue-300 bg-blue-50 text-blue-700", dot: "bg-blue-500" };
    return { label: "Pendiente", className: "border-gray-300 bg-gray-50 text-gray-600", dot: "bg-gray-400" };
  }

  function sponsorStatusColor(value: string | undefined) {
    const status = normalizeSponsorStatus(value);
    if (status === "Finalizado") return "#10b981";
    if (status === "No aprobado") return "#eb0028";
    if (status === "En contacto") return "#3b82f6";
    return "#9ca3af";
  }

  function volunteerStatusMeta(value: string | undefined) {
    const status = normalizeVolunteerStatus(value);
    if (status === "Aprobado") return { label: "Aprobado", className: "border-emerald-300 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" };
    if (status === "Rechazado") return { label: "Rechazado", className: "border-red-300 bg-red-50 text-[var(--color-ted-red)]", dot: "bg-[var(--color-ted-red)]" };
    if (status === "En revision") return { label: "En revision", className: "border-blue-300 bg-blue-50 text-blue-700", dot: "bg-blue-500" };
    return { label: "Pendiente", className: "border-gray-300 bg-gray-50 text-gray-600", dot: "bg-gray-400" };
  }

  function volunteerStatusColor(value: string | undefined) {
    const status = normalizeVolunteerStatus(value);
    if (status === "Aprobado") return "#10b981";
    if (status === "Rechazado") return "#eb0028";
    if (status === "En revision") return "#3b82f6";
    return "#9ca3af";
  }

  function splitLinks(text: string | null | undefined) {
    if (!text) return [] as Array<{ type: "text" | "link"; value: string }>;
    const matches = text.match(/https?:\/\/[^\s)\]\}]+/gi);
    if (!matches || matches.length === 0) return [{ type: "text" as const, value: text }];
    const parts: Array<{ type: "text" | "link"; value: string }> = [];
    let cursor = 0;
    for (const match of text.matchAll(/https?:\/\/[^\s)\]\}]+/gi)) {
      const index = match.index ?? 0;
      if (index > cursor) parts.push({ type: "text", value: text.slice(cursor, index) });
      parts.push({ type: "link", value: match[0] });
      cursor = index + match[0].length;
    }
    if (cursor < text.length) parts.push({ type: "text", value: text.slice(cursor) });
    return parts;
  }

  function renderTextWithLinks(text: string | null | undefined) {
    const parts = splitLinks(text);
    if (parts.length === 0) return <span>—</span>;

    return (
      <div className="flex flex-wrap gap-2">
        {parts.map((part, index) =>
          part.type === "link" ? (
            <a
              key={`${part.value}-${index}`}
              href={ensureProtocol(part.value)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700 transition hover:bg-sky-100"
            >
              {getShortLinkLabel(part.value)}
            </a>
          ) : (
            <span key={`${index}-${part.value}`} className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {part.value}
            </span>
          )
        )}
      </div>
    );
  }
              <div className="mt-1 text-xs text-gray-500">La papelera segura usa <span className="font-mono text-gray-300">{SPONSOR_TRASH_COLLECTION}</span>.</div>

  function renderExpandableText(recordId: string, field: string, text: string | null | undefined) {
    const safeText = (text || "").trim() || "—";
    const key = `${recordId}:${field}`;
    const isExpanded = !!expandedFields[key];
    const isLong = safeText !== "—" && safeText.length > 180;

    return (
      <div>
        <div className={!isExpanded && isLong ? "max-h-24 overflow-hidden" : undefined}>
          {renderTextWithLinks(safeText)}
        </div>
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpandedFields((prev) => ({ ...prev, [key]: !isExpanded }))}
            className="mt-2 text-xs font-semibold text-[var(--color-ted-red)] underline underline-offset-2"
          >
            {isExpanded ? "Ver menos" : "Ver más..."}
          </button>
        ) : null}
      </div>
    );
  }

  function openEdit(kind: "speaker" | "sponsor", data: any) {
    setEditingRecord({ kind, data });
    setEditDraft({ ...data });
    setEditError("");
    setCardMenuFor(null);
    setStatusMenuFor(null);
  }

  function openApproveSpeaker(data: any) {
    setApprovingSpeaker(data);
    setApprovalDraft({
      ...data,
      name: data.nombre ?? "",
      profile: data.perfil ?? "",
      title: data.tituloCharla ?? "",
      centralIdea: data.idea ?? "",
      description: data.novedad ?? "",
    });
    setApprovalPhotoFile(null);
    setApprovalPhotoPreview("");
    setApprovalError("");
    setCardMenuFor(null);
    setStatusMenuFor(null);
  }

  function openApproveSponsor(data: any) {
    setApprovingSponsor(data);
    setSponsorApprovalDraft({
      ...data,
      companyName: data.companyName ?? "",
      sponsorLevel: data.sponsorLevel ?? "apoyo",
      companySector: data.companySector ?? "",
      contactName: data.contactName ?? "",
      contactRole: data.contactRole ?? "",
      website: data.website ?? "",
      sponsorshipType: data.sponsorshipType ?? "",
      cashAmount: data.cashAmount ?? "",
      inKindDescription: data.inKindDescription ?? "",
      customProposal: data.customProposal ?? "",
      budgetRange: data.budgetRange ?? "",
      eventInterest: data.eventInterest ?? "",
      notes: data.notes ?? "",
    });
    setSponsorLogoFile(null);
    setSponsorLogoPreview("");
    setSponsorAspectMode("rectangular");
    setSponsorLogoZoom(1);
    setSponsorLogoOffsetX(50);
    setSponsorLogoOffsetY(50);
    setSponsorApprovalError("");
    setCardMenuFor(null);
    setStatusMenuFor(null);
  }

  function updateEditField(field: string, value: any) {
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  }

  function updateApprovalField(field: string, value: any) {
    setApprovalDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleApprovalPhotoChange(file: File | null) {
    setApprovalPhotoFile(file);
  }

  function handleSponsorLogoChange(file: File | null) {
    if (!file) {
      setSponsorLogoFile(null);
      resetSponsorCropControls();
      setSponsorCropEditorOpen(false);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSponsorApprovalError("Selecciona un archivo de imagen válido (PNG, JPG, WEBP, SVG, etc.).");
      return;
    }

    const maxFileSize = 8 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setSponsorApprovalError("La imagen supera el límite de 8MB. Sube un archivo más liviano.");
      return;
    }

    setSponsorApprovalError("");
    setSponsorLogoFile(file);
    resetSponsorCropControls();
    setSponsorCropEditorOpen(true);
  }

  function updateSponsorApprovalField(field: string, value: any) {
    setSponsorApprovalDraft((prev) => ({ ...prev, [field]: value }));
  }

  async function saveEdit() {
    if (!editingRecord) return;
    setEditSaving(true);
    setEditError("");
    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const db = firebaseModule.getClientDb();
      const collectionName = editingRecord.kind === "speaker" ? "ponentesTedx" : "sponsorsTedx";
      const docRef = firestore.doc(db, collectionName, editingRecord.data.id);

      await firestore.updateDoc(docRef, editDraft);

      const nextStatus = typeof editDraft.status === "string" ? editDraft.status.trim() : "";
      const previousStatus = typeof editingRecord.data.status === "string" ? editingRecord.data.status.trim() : "";
      if (nextStatus && nextStatus !== previousStatus) {
        const source = editingRecord.kind === "speaker" ? "speakers" : "patrocinios";
        const recipientEmail = editingRecord.kind === "speaker"
          ? editingRecord.data.correo?.trim()
          : editingRecord.data.email?.trim();
        const recipientName = editingRecord.kind === "speaker"
          ? (editingRecord.data.nombre ?? "Participante").trim()
          : (editingRecord.data.contactName ?? editingRecord.data.companyName ?? "Participante").trim();

        if (recipientEmail) {
          try {
            await sendStatusChangeEmail({
              recipientEmail,
              recipientName,
              source,
              applicationStatus: nextStatus,
              trackingUrl: `${window.location.origin}/status?id=${editingRecord.data.id}`,
            });
          } catch (mailError) {
            console.error("Error sending status email from edit modal:", mailError);
          }
        }
      }

      if (editingRecord.kind === "speaker") {
        setPosts((prev) => prev.map((item) => (item.id === editingRecord.data.id ? { ...item, ...editDraft } : item)));
      } else {
        setSponsors((prev) => prev.map((item) => (item.id === editingRecord.data.id ? { ...item, ...editDraft } : item)));
      }

      setEditingRecord(null);
      setEditDraft({});
    } catch (err: any) {
      setEditError(err.message || String(err));
    } finally {
      setEditSaving(false);
    }
  }

  async function confirmApproval() {
    if (!approvingSpeaker) return;

    const requiredFields = [
      { key: "name", label: "nombre completo" },
      { key: "profile", label: "ocupación/perfil" },
      { key: "title", label: "nombre de la ponencia" },
      { key: "centralIdea", label: "idea central" },
      { key: "description", label: "descripción" },
    ];

    const missing = requiredFields.filter(({ key }) => !(String(approvalDraft[key] ?? "").trim()));
    if (!approvalPhotoFile) {
      missing.unshift({ key: "photoFile", label: "foto de perfil" });
    }
    if (missing.length > 0) {
      setApprovalError(`Completa y confirma: ${missing.map((item) => item.label).join(", ")}.`);
      return;
    }

    setApprovalSaving(true);
    setApprovalError("");

    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const storageModule = await import("firebase/storage");
      const db = firebaseModule.getClientDb();
      const storage = firebaseModule.getClientStorage();
      const docRef = firestore.doc(db, "ponentesTedx", approvingSpeaker.id);

      const fileExtension = approvalPhotoFile?.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = String(approvalDraft.name || approvingSpeaker.nombre || "speaker")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "speaker";
      const storageRef = storageModule.ref(storage, `speaker-photos/${approvingSpeaker.id}/${Date.now()}_${safeName}.${fileExtension}`);

      await storageModule.uploadBytes(storageRef, approvalPhotoFile as File);
      const photoUrl = await storageModule.getDownloadURL(storageRef);

      const payload = {
        photoUrl,
        nombre: String(approvalDraft.name).trim(),
        perfil: String(approvalDraft.profile).trim(),
        tituloCharla: String(approvalDraft.title).trim(),
        idea: String(approvalDraft.centralIdea).trim(),
        novedad: String(approvalDraft.description).trim(),
        status: "Aprobada",
      };

      await firestore.updateDoc(docRef, payload);

      if (approvingSpeaker?.correo) {
        try {
          await sendStatusChangeEmail({
            recipientEmail: String(approvingSpeaker.correo).trim(),
            recipientName: String(payload.nombre || approvingSpeaker.nombre || "Participante").trim(),
            source: "speakers",
            applicationStatus: "Aprobada",
            trackingUrl: `${window.location.origin}/status?id=${approvingSpeaker.id}`,
          });
        } catch (mailError) {
          console.error("Error sending speaker approval email:", mailError);
        }
      }

      setPosts((prev) => prev.map((item) => (item.id === approvingSpeaker.id ? { ...item, ...payload } : item)));
      setApprovingSpeaker(null);
      setApprovalDraft({});
      setApprovalPhotoFile(null);
      setApprovalPhotoPreview("");
    } catch (err: any) {
      setApprovalError(err.message || String(err));
    } finally {
      setApprovalSaving(false);
    }
  }

  async function confirmSponsorApproval() {
    if (!approvingSponsor) return;

    const requiredFields = [
      { key: "sponsorLevel", label: "nivel de sponsor" },
      { key: "companyName", label: "nombre de la empresa" },
    ];

    const missing = requiredFields.filter(({ key }) => !(String(sponsorApprovalDraft[key] ?? "").trim()));
    if (!sponsorLogoFile) {
      missing.unshift({ key: "logoFile", label: "logo o imagen del sponsor" });
    }
    if (missing.length > 0) {
      setSponsorApprovalError(`Completa y confirma: ${missing.map((item) => item.label).join(", ")}.`);
      return;
    }

    setSponsorApprovalSaving(true);
    setSponsorApprovalError("");

    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const storageModule = await import("firebase/storage");
      const db = firebaseModule.getClientDb();
      const storage = firebaseModule.getClientStorage();
      const docRef = firestore.doc(db, "sponsorsTedx", approvingSponsor.id);

      const croppedLogoBlob = await cropSponsorLogoFile(sponsorLogoFile as File, {
        aspectMode: sponsorAspectMode,
        zoom: sponsorLogoZoom,
        offsetX: sponsorLogoOffsetX,
        offsetY: sponsorLogoOffsetY,
      });

      const safeName = String(sponsorApprovalDraft.companyName || approvingSponsor.companyName || "sponsor")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "sponsor";
      const storageRef = storageModule.ref(storage, `sponsor-logos/${approvingSponsor.id}/${Date.now()}_${safeName}.png`);

      await storageModule.uploadBytes(storageRef, croppedLogoBlob, { contentType: "image/png" });
      const logoUrl = await storageModule.getDownloadURL(storageRef);

      const payload = {
        logoUrl,
        sponsorLevel: String(sponsorApprovalDraft.sponsorLevel || "apoyo").toLowerCase() === "sponsor" ? "sponsor" : "apoyo",
        companyName: String(sponsorApprovalDraft.companyName).trim(),
        website: String(sponsorApprovalDraft.website ?? "").trim(),
        logoAspect: sponsorAspectMode,
        status: "Finalizado",
      };

      await firestore.updateDoc(docRef, payload);

      if (approvingSponsor?.email) {
        try {
          await sendStatusChangeEmail({
            recipientEmail: String(approvingSponsor.email).trim(),
            recipientName: String(sponsorApprovalDraft.contactName || approvingSponsor.contactName || approvingSponsor.companyName || "Participante").trim(),
            source: "patrocinios",
            applicationStatus: "Finalizado",
            trackingUrl: `${window.location.origin}/status?id=${approvingSponsor.id}`,
          });
        } catch (mailError) {
          console.error("Error sending sponsor status email:", mailError);
        }
      }

      setSponsors((prev) => prev.map((item) => (item.id === approvingSponsor.id ? { ...item, ...payload } : item)));
      setApprovingSponsor(null);
      setSponsorApprovalDraft({});
      setSponsorLogoFile(null);
      setSponsorLogoPreview("");
      setSponsorCropEditorOpen(false);
      setSponsorAspectMode("rectangular");
      resetSponsorCropControls();
    } catch (err: any) {
      setSponsorApprovalError(err.message || String(err));
    } finally {
      setSponsorApprovalSaving(false);
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-gray-900 px-6">
        <p className="text-gray-400 font-mono tracking-widest text-sm animate-pulse">CARGANDO...</p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center bg-gray-900 px-6 font-sans selection:bg-[var(--color-ted-red)] selection:text-white">
        <div className="w-full max-w-sm bg-black border border-gray-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-ted-red)]"></div>
          <div className="flex justify-center mb-8 mt-2">
            <Image src={logoWhite} alt="TEDx" className="h-10 w-auto" />
          </div>
          <p className="text-gray-400 text-xs font-mono text-center mb-8 uppercase tracking-widest">Portal de Revisores</p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (loginEmail === process.env.NEXT_PUBLIC_EMAIL && loginPass === process.env.NEXT_PUBLIC_PASSWORD) {
                setIsLoggedIn(true);
                setLoginError("");
              } else {
                setLoginError("Credenciales incorrectas");
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Correo Electrónico</label>
              <input 
                suppressHydrationWarning
                type="email" 
                value={loginEmail} 
                onChange={e => setLoginEmail(e.target.value)} 
                className="w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-ted-red)] transition-colors placeholder-gray-700 font-mono text-sm"
                placeholder="admin@tedx.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Contraseña</label>
              <input 
                suppressHydrationWarning
                type="password" 
                value={loginPass} 
                onChange={e => setLoginPass(e.target.value)} 
                className="w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-ted-red)] transition-colors placeholder-gray-700 font-mono text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && <p className="text-[var(--color-ted-red)] text-sm font-semibold pt-1">{loginError}</p>}
            <button type="submit" className="w-full bg-[var(--color-ted-red)] hover:bg-[#c00020] text-white font-bold py-3.5 rounded-lg transition-colors mt-6 uppercase tracking-wider text-sm shadow-lg shadow-red-900/20 hover:shadow-red-900/40">
              Ingresar al Panel
            </button>
          </form>
        </div>
        <p className="mt-8 text-xs text-gray-600 font-mono">Evento Independiente operado bajo licencia TED</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(235,0,40,0.18),transparent_35%),linear-gradient(180deg,#111827_0%,#050505_100%)] text-white selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">
      <header className="border-b border-black/5 bg-black text-[#222] sticky top-0 z-20 shadow-md">
        <nav className="relative mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
          <Link href="/" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-[4.5rem] w-auto brightness-0 invert" />
          </Link>

          <ul className="hidden items-center gap-6 text-base font-medium md:flex text-white">
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/">
                Inicio
              </Link>
            </li>
            <li>
              <Link className="transition text-[var(--color-ted-red)] font-semibold" href="/admin">
                Panel Admin
              </Link>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </header>

      <div className="flex-1 mx-auto w-full max-w-[88rem] px-6 py-12">
        {copyNotice ? (
          <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {copyNotice}
          </div>
        ) : null}

        <header className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--color-ted-red)]">Administrador TEDx Avenida Bolivar</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Panel de revisión</h1>
              <div className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">Alterna entre ponentes, sponsors, voluntariado y configuración de página con selección masiva, papelera segura y acciones por panel.</div>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/45 p-1.5 shadow-inner shadow-black/40 sm:flex sm:w-auto sm:flex-nowrap sm:rounded-full">
              <button
                type="button"
                onClick={() => setActivePanel("speakers")}
                className={`min-w-0 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-1 sm:px-5 ${activePanel === "speakers" ? "bg-[var(--color-ted-red)] text-white shadow-lg" : "text-gray-300 hover:text-white"}`}
              >
                Ponentes
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("sponsors")}
                className={`min-w-0 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-1 sm:px-5 ${activePanel === "sponsors" ? "bg-[var(--color-ted-red)] text-white shadow-lg" : "text-gray-300 hover:text-white"}`}
              >
                Sponsors
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("volunteers")}
                className={`min-w-0 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-1 sm:px-5 ${activePanel === "volunteers" ? "bg-[var(--color-ted-red)] text-white shadow-lg" : "text-gray-300 hover:text-white"}`}
              >
                Voluntariado
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("page")}
                className={`min-w-0 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-1 sm:px-5 ${activePanel === "page" ? "bg-[var(--color-ted-red)] text-white shadow-lg" : "text-gray-300 hover:text-white"}`}
              >
                Pagina
              </button>
            </div>
          </div>
        </header>

        <div className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-sm md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-center sm:px-4 sm:text-left">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gray-400">Ponentes</p>
              <p className="mt-1 text-2xl font-bold text-white">{posts.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-center sm:px-4 sm:text-left">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gray-400">Sponsors</p>
              <p className="mt-1 text-2xl font-bold text-white">{sponsors.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-center sm:px-4 sm:text-left">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gray-400">Voluntariado</p>
              <p className="mt-1 text-2xl font-bold text-white">{volunteers.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-center sm:px-4 sm:text-left">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gray-400">Pagina</p>
              <p className="mt-1 text-2xl font-bold text-white">1</p>
            </div>
          </div>

          <div className="hidden md:block" />
        </div>

        <section className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div ref={menuRef} className="relative z-10 w-fit">
            <button onClick={() => setMenuOpen(v => !v)} className="rounded-md border border-[var(--color-ted-red)] bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-ted-red)] focus:outline-none transition-colors min-w-[140px] text-left relative flex justify-between items-center shadow-lg">
              Acciones <span className="text-[10px] ml-2">▼</span>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-gray-700 bg-black p-1.5 text-white shadow-xl">
                <button onClick={() => { setSelectionMode(true); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 rounded transition-colors">Activar selección</button>
                <button onClick={() => { setSelectionMode(false); clearSelection(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 rounded transition-colors">Desactivar selección</button>
                {selectionMode && activePanel !== "page" && (
                  <>
                    <button onClick={() => { selectAll(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 rounded transition-colors">Seleccionar todo</button>
                    <div className="my-1 h-px bg-gray-800 mx-1" />
                    {getBulkStatusOptions().map((statusOption) => {
                      const isPositive = /aprobad|finalizado/i.test(statusOption);
                      const isDanger = /rechazad|no aprobado/i.test(statusOption);
                      const isWarning = /reserva/i.test(statusOption);
                      const textClass = isPositive ? "text-green-400" : isDanger ? "text-[var(--color-ted-red)]" : isWarning ? "text-yellow-300" : "text-gray-300";

                      return (
                        <button
                          key={statusOption}
                          onClick={() => { setMenuOpen(false); updateStatusForSelected(statusOption); }}
                          disabled={processing || selectedIds.length === 0}
                          className={`w-full rounded px-3 py-2 text-left text-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30 ${textClass}`}
                        >
                          Marcar {statusOption}
                        </button>
                      );
                    })}
                    <div className="my-1 h-px bg-gray-800 mx-1" />
                    <button onClick={() => { setMenuOpen(false); deleteSelected(); }} disabled={processing || selectedIds.length===0} className="w-full text-left px-3 py-2 text-sm text-[var(--color-ted-red)] font-semibold hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Mover a papelera segura</button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            {selectionMode && activePanel !== "page" ? <span className="bg-black border border-gray-600 px-3 py-1.5 rounded-full text-white font-mono shadow-inner shadow-black/50 tracking-wider text-xs uppercase">{getSelectionSummary()}: {selectedIds.length}</span> : null}
          </div>
        </section>

        <div className={activePanel === "speakers" ? "block" : "hidden"}>
          <section className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Solicitudes de postulación</h2>
              <div className="text-sm text-gray-400">Colección actual: <span className="font-mono text-[var(--color-ted-red)]">ponentesTedx</span></div>
              <div className="mt-1 text-xs text-gray-500">Las eliminaciones se respaldan en <span className="font-mono text-gray-300">{SPEAKER_TRASH_COLLECTION}</span> antes de borrar el registro original.</div>
            </div>
          </section>

          {loading && <p className="py-8 text-center text-lg font-mono tracking-wider animate-pulse text-gray-400">CARGANDO BASE DE DATOS...</p>}
          {error && <p className="rounded border border-[var(--color-ted-red)] bg-black/50 p-4 font-medium text-[var(--color-ted-red)] shadow-lg">Error de conexión: {error}</p>}

          {!loading && !error && posts.length === 0 ? (
            <div className="rounded-lg border border-gray-800 bg-black/40 py-20 text-center shadow-inner">
              <p className="font-mono text-lg text-gray-500">No se han recibido postulaciones</p>
            </div>
          ) : null}

          <section className="grid gap-6">
            {posts.map((p) => (
              <article key={p.id} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-black shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute left-0 top-0 h-full w-2" style={{ backgroundColor: speakerStatusColor(p.status) }} />
                <div className="flex items-start gap-4 pl-4">
                  {selectionMode ? (
                    <div className="pt-1.5">
                      <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="h-5 w-5 cursor-pointer rounded border-gray-300 text-[var(--color-ted-red)] focus:ring-[var(--color-ted-red)]" />
                    </div>
                  ) : null}

                  <div className="min-w-0 flex-1 w-full">
                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-bold tracking-tight text-gray-900">{p.nombre || "—"}</h3>
                          <div className="relative" ref={cardMenuFor?.kind === "speaker" && cardMenuFor.id === p.id ? cardMenuRef : undefined}>
                            <button
                              type="button"
                              onClick={() => setCardMenuFor(cardMenuFor?.kind === "speaker" && cardMenuFor.id === p.id ? null : { kind: "speaker", id: p.id })}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-lg font-semibold text-gray-500 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
                              aria-label="Editar postulación"
                            >
                              ⋯
                            </button>
                            {cardMenuFor?.kind === "speaker" && cardMenuFor.id === p.id ? (
                              <div className="absolute left-0 top-11 z-50 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.15)]">
                                <button type="button" onClick={() => openEdit("speaker", p)} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                                  Editar postulación
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-600">
                          <button type="button" onClick={() => copyEmail(p.correo)} className="underline underline-offset-2 hover:text-[var(--color-ted-red)]">
                            {p.correo || "—"}
                          </button>
                          <span className="hidden text-gray-300 sm:inline">•</span>
                          <span>{p.telefono || "—"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <span className="rounded-sm border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-500">{formatDate(p.createdAt)}</span>
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-[10px] text-gray-400" title={p.id}>ID_{p.id.substring(0, 8)}</div>
                          <button onClick={() => generatePDF(p)} disabled={processing} className="rounded bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50">
                            PDF + QR
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 rounded-2xl border border-black/[0.05] bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.015))] p-5 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-4 rounded-2xl border border-white bg-white p-4 text-sm shadow-sm">
                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Perfil Profesional</span>
                          <p className="font-medium text-gray-900">{p.perfil === "Otro" ? `${p.perfil} - ${p.perfilOtro || ""}` : (p.perfil || "—")}</p>
                        </div>
                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Edad</span>
                          <p className="font-medium text-gray-900">{p.edad ?? "—"} <span className="font-normal text-gray-500">años</span></p>
                        </div>
                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Categorías de Interés</span>
                          <p className="leading-snug text-gray-900 font-medium">{(p.categorias && p.categorias.length) ? p.categorias.join(" / ") : "—"} {p.categoriaOtra ? ` (${p.categoriaOtra})` : ""}</p>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-2xl border border-white bg-white p-4 text-sm shadow-sm lg:col-span-2">
                        <div className="flex flex-col gap-3">
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Título de la Charla (Propuesta)</span>
                          <p className="rounded-xl bg-gray-50 px-4 py-3 text-lg font-bold text-gray-900">{p.tituloCharla || "—"}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-5 pt-1 lg:grid-cols-2">
                          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Idea Central</span>
                            <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`speaker-${p.id}`, "idea", p.idea || "—")}</div>
                          </div>
                          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Impacto / Novedad</span>
                            <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`speaker-${p.id}`, "novedad", p.novedad || "—")}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                        {p.linkedin ? (
                          <a href={ensureProtocol(p.linkedin)} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-[#0077b5] px-3 py-1.5 text-xs text-white shadow-sm transition hover:bg-[#005e93]">
                            LinkedIn ↗
                          </a>
                        ) : null}
                        {p.redes ? (
                          <div className="max-w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                            {renderExpandableText(`speaker-${p.id}`, "redes", p.redes)}
                          </div>
                        ) : null}
                        {p.videoLink ? (
                          <a href={ensureProtocol(p.videoLink)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-sm transition hover:bg-emerald-100">
                            Pitch
                          </a>
                        ) : null}
                      </div>

                      <div ref={statusMenuFor === p.id ? statusMenuRef : undefined} className="relative mt-2 sm:mt-0">
                        <button
                          onClick={() => setStatusMenuFor(statusMenuFor === p.id ? null : p.id)}
                          className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 ${
                            speakerStatusMeta(p.status).className
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full shadow-inner ${speakerStatusMeta(p.status).dot}`} />
                          Estatus: {speakerStatusMeta(p.status).label} ▾
                        </button>

                        {statusMenuFor === p.id ? (
                          <div className="absolute bottom-full right-0 z-50 mb-2 w-48 rounded-lg border border-gray-200 bg-white p-2 text-black shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]">
                            <button onClick={() => openEdit("speaker", p)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-50">
                              <span className="h-2.5 w-2.5 rounded-full bg-gray-500 shadow-sm" /> Editar
                            </button>
                            <div className="mx-2 my-1 h-px bg-gray-100" />
                            <button onClick={() => openApproveSpeaker(p)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-green-700 transition-colors hover:bg-green-50">
                              <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm" /> Aprobada
                            </button>
                            <button onClick={() => updateStatusForSingle(p.id, "Rechazada")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-ted-red)] transition-colors hover:bg-red-50">
                              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-ted-red)] shadow-sm" /> Rechazada
                            </button>
                            <button onClick={() => updateStatusForSingle(p.id, "Reserva")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-yellow-700 transition-colors hover:bg-yellow-50">
                              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-sm" /> Reserva
                            </button>
                            <div className="mx-2 my-1 h-px bg-gray-100" />
                            <button onClick={() => updateStatusForSingle(p.id, "Pendiente")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors hover:bg-gray-50">
                              <span className="h-2.5 w-2.5 rounded-full bg-gray-400 shadow-sm" /> Pendiente
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>

        <div className={activePanel === "sponsors" ? "block" : "hidden"}>
          <section className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Solicitudes de patrocinio</h2>
              <div className="text-sm text-gray-400">Colección actual: <span className="font-mono text-[var(--color-ted-red)]">sponsorsTedx</span></div>
              <div className="mt-1 text-xs text-gray-500">La papelera segura usa <span className="font-mono text-gray-300">{SPONSOR_TRASH_COLLECTION}</span>.</div>
            </div>
          </section>

          {sponsorsLoading && <p className="py-8 text-center text-lg font-mono tracking-wider animate-pulse text-gray-400">CARGANDO PATROCINIOS...</p>}
          {sponsorsError && <p className="rounded border border-[var(--color-ted-red)] bg-black/50 p-4 font-medium text-[var(--color-ted-red)] shadow-lg">Error de conexión: {sponsorsError}</p>}

          {!sponsorsLoading && !sponsorsError && sponsors.length === 0 ? (
            <div className="rounded-lg border border-gray-800 bg-black/40 py-20 text-center shadow-inner">
              <p className="font-mono text-lg text-gray-500">No se han recibido solicitudes de patrocinio</p>
            </div>
          ) : null}

          <section className="grid gap-6">
            {sponsors.map((sponsor) => (
              <article key={sponsor.id} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-black shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute left-0 top-0 h-full w-2" style={{ backgroundColor: sponsorStatusColor(sponsor.status) }} />
                <div className="mb-4 flex flex-col gap-3 pl-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    {selectionMode ? (
                      <input type="checkbox" checked={selectedIds.includes(sponsor.id)} onChange={() => toggleSelect(sponsor.id)} className="mt-2 h-5 w-5 cursor-pointer rounded border-gray-300 text-[var(--color-ted-red)] focus:ring-[var(--color-ted-red)]" />
                    ) : null}
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold tracking-tight text-gray-900">{sponsor.companyName || "—"}</h3>
                        <div className="relative" ref={cardMenuFor?.kind === "sponsor" && cardMenuFor.id === sponsor.id ? cardMenuRef : undefined}>
                          <button
                            type="button"
                            onClick={() => setCardMenuFor(cardMenuFor?.kind === "sponsor" && cardMenuFor.id === sponsor.id ? null : { kind: "sponsor", id: sponsor.id })}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-lg font-semibold text-gray-500 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
                            aria-label="Editar solicitud"
                          >
                            ⋯
                          </button>
                          {cardMenuFor?.kind === "sponsor" && cardMenuFor.id === sponsor.id ? (
                            <div className="absolute left-0 top-11 z-50 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.15)]">
                              <button type="button" onClick={() => openEdit("sponsor", sponsor)} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                                Editar solicitud
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-600">
                        <button type="button" onClick={() => copyEmail(sponsor.email)} className="underline underline-offset-2 hover:text-[var(--color-ted-red)]">
                          {sponsor.email || "—"}
                        </button>
                        <span className="hidden text-gray-300 sm:inline">•</span>
                        <span>{sponsor.phone || "—"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span className="w-fit rounded-sm border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">{formatDate(sponsor.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-[10px] text-gray-400" title={sponsor.id}>ID_{sponsor.id.substring(0, 8)}</div>
                      <button onClick={() => generateSponsorDoc(sponsor)} disabled={processing} className="rounded bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50">
                        PDF + QR
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-4 rounded-2xl border border-black/[0.05] bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.015))] p-5 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-4 rounded-2xl border border-white bg-white p-4 text-sm shadow-sm">
                    <div>
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Empresa</span>
                      <p className="font-medium text-gray-900">{sponsor.companyName || "—"}</p>
                    </div>
                    <div>
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Giro / Sector</span>
                      <p className="font-medium text-gray-900">{sponsor.companySector || "—"}</p>
                    </div>
                    <div>
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Encargado</span>
                      <p className="font-medium text-gray-900">{sponsor.contactName || "—"}</p>
                    </div>
                    <div>
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Cargo</span>
                      <p className="font-medium text-gray-900">{sponsor.contactRole || "—"}</p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-white bg-white p-4 text-sm shadow-sm lg:col-span-2">
                    <div className="grid grid-cols-1 gap-5 pt-1 lg:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Forma de patrocinio</span>
                        <div className="text-sm leading-relaxed text-gray-700">{sponsor.sponsorshipType ? formatSponsorType(sponsor.sponsorshipType) : "—"}</div>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Rango de presupuesto</span>
                        <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`sponsor-${sponsor.id}`, "budgetRange", sponsor.budgetRange || "—")}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 pt-1 lg:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Qué desea apoyar</span>
                        <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`sponsor-${sponsor.id}`, "eventInterest", sponsor.eventInterest || "—")}</div>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Notas</span>
                        <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`sponsor-${sponsor.id}`, "notes", sponsor.notes || "—")}</div>
                      </div>
                    </div>
                    {sponsor.sponsorshipType === "efectivo" ? (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Monto aproximado</span>
                        <div className="text-sm leading-relaxed text-gray-700">{sponsor.cashAmount || "—"}</div>
                      </div>
                    ) : null}
                    {sponsor.sponsorshipType === "especie" ? (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Aporte en especie</span>
                        <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`sponsor-${sponsor.id}`, "inKindDescription", sponsor.inKindDescription || "—")}</div>
                      </div>
                    ) : null}
                    {sponsor.sponsorshipType === "personalizado" ? (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Propuesta personalizada</span>
                        <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`sponsor-${sponsor.id}`, "customProposal", sponsor.customProposal || "—")}</div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                    {sponsor.website ? (
                      <a href={ensureProtocol(sponsor.website)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 shadow-sm transition hover:bg-sky-100">
                        {getShortLinkLabel(sponsor.website)}
                      </a>
                    ) : null}
                  </div>

                  <div ref={statusMenuFor === sponsor.id ? statusMenuRef : undefined} className="relative">
                    <button
                      type="button"
                      onClick={() => setStatusMenuFor(statusMenuFor === sponsor.id ? null : sponsor.id)}
                      className={`inline-flex items-center rounded-md border px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${sponsorStatusMeta(sponsor.status).className}`}
                    >
                      <span className={`mr-2 h-2 w-2 rounded-full shadow-inner ${sponsorStatusMeta(sponsor.status).dot}`} />
                      Estado: {sponsorStatusMeta(sponsor.status).label} ▾
                    </button>

                    {statusMenuFor === sponsor.id ? (
                      <div className="absolute bottom-full right-0 z-50 mb-2 w-52 rounded-xl border border-gray-200 bg-white p-2 text-black shadow-[0_14px_40px_rgba(0,0,0,0.15)]">
                        <button onClick={() => updateStatusForSingle(sponsor.id, "Pendiente", "sponsor")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-50">
                          <span className="h-2.5 w-2.5 rounded-full bg-gray-400 shadow-sm" /> Pendiente
                        </button>
                        <button onClick={() => updateStatusForSingle(sponsor.id, "En contacto", "sponsor")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-blue-700 transition-colors hover:bg-blue-50">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm" /> En contacto
                        </button>
                        <button onClick={() => openApproveSponsor(sponsor)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-700 transition-colors hover:bg-emerald-50">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" /> Finalizado
                        </button>
                        <button onClick={() => updateStatusForSingle(sponsor.id, "No aprobado", "sponsor")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-ted-red)] transition-colors hover:bg-red-50">
                          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-ted-red)] shadow-sm" /> No aprobado
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>

        <div className={activePanel === "volunteers" ? "block" : "hidden"}>
          <section className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Solicitudes de voluntariado</h2>
              <div className="text-sm text-gray-400">Colección actual: <span className="font-mono text-[var(--color-ted-red)]">voluntariosTedx</span></div>
              <div className="mt-1 text-xs text-gray-500">La papelera segura usa <span className="font-mono text-gray-300">{VOLUNTEER_TRASH_COLLECTION}</span>.</div>
            </div>
          </section>

          {volunteersLoading && <p className="py-8 text-center text-lg font-mono tracking-wider animate-pulse text-gray-400">CARGANDO VOLUNTARIADO...</p>}
          {volunteersError && <p className="rounded border border-[var(--color-ted-red)] bg-black/50 p-4 font-medium text-[var(--color-ted-red)] shadow-lg">Error de conexión: {volunteersError}</p>}
          {volunteerPhotoError ? <p className="mt-4 rounded border border-[var(--color-ted-red)] bg-black/50 p-4 font-medium text-[var(--color-ted-red)] shadow-lg">{volunteerPhotoError}</p> : null}

          {!volunteersLoading && !volunteersError && volunteers.length === 0 ? (
            <div className="rounded-lg border border-gray-800 bg-black/40 py-20 text-center shadow-inner">
              <p className="font-mono text-lg text-gray-500">No se han recibido solicitudes de voluntariado</p>
            </div>
          ) : null}

          <section className="grid gap-6">
            {volunteers.map((volunteer) => {
              const isVolunteerExpanded = !!expandedVolunteerCards[volunteer.id];

              return (
              <article key={volunteer.id} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-black shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl sm:p-6">
                <div className="absolute left-0 top-0 h-full w-2" style={{ backgroundColor: volunteerStatusColor(volunteer.status) }} />

                <div className="mb-5 flex flex-col gap-4 pl-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {selectionMode ? (
                      <input type="checkbox" checked={selectedIds.includes(volunteer.id)} onChange={() => toggleSelect(volunteer.id)} className="mt-2 h-5 w-5 cursor-pointer rounded border-gray-300 text-[var(--color-ted-red)] focus:ring-[var(--color-ted-red)]" />
                    ) : null}
                    <div className="w-full shrink-0 sm:w-[84px]">
                      {volunteer.photoUrl ? (
                        <button
                          type="button"
                          onPointerUp={() => setVolunteerImageViewer({ src: volunteer.photoUrl, name: volunteer.fullName || "Voluntario" })}
                          onClick={() => setVolunteerImageViewer({ src: volunteer.photoUrl, name: volunteer.fullName || "Voluntario" })}
                          className="block w-full touch-manipulation"
                          aria-label="Ver foto en grande"
                        >
                          <Image
                            src={volunteer.photoUrl}
                            alt={volunteer.fullName ? `Foto de ${volunteer.fullName}` : "Foto de voluntario"}
                            width={84}
                            height={84}
                            className="h-24 w-full rounded-xl border border-gray-200 object-cover transition hover:opacity-90 hover:ring-2 hover:ring-[var(--color-ted-red)] sm:h-[84px] sm:w-[84px]"
                            unoptimized
                          />
                        </button>
                      ) : (
                        <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-[10px] font-semibold uppercase tracking-wider text-gray-500 sm:h-[84px] sm:w-[84px]">
                          Sin foto
                        </div>
                      )}

                      <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-700 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]">
                        {volunteerPhotoSavingId === volunteer.id ? "Guardando..." : volunteer.photoUrl ? "Cambiar" : "Agregar"}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={volunteerPhotoSavingId === volunteer.id}
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            void handleVolunteerPhotoUpload(volunteer, file);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>

                    <div className="min-w-0">
                    <h3 className="break-words text-2xl font-bold tracking-tight text-gray-900">{volunteer.fullName || "—"}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-600">
                      <button type="button" onClick={() => copyEmail(volunteer.email)} className="break-all text-left underline underline-offset-2 hover:text-[var(--color-ted-red)]">
                        {volunteer.email || "—"}
                      </button>
                      <span className="hidden text-gray-300 sm:inline">•</span>
                      <span>{volunteer.phone || "—"}</span>
                    </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span className="w-fit rounded-sm border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">{formatDate(volunteer.createdAt)}</span>
                    <div className="font-mono text-[10px] text-gray-400" title={volunteer.id}>ID_{volunteer.id.substring(0, 8)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-black/[0.05] bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.015))] p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-4 rounded-2xl border border-white bg-white p-4 text-sm shadow-sm">
                    <div>
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Edad</span>
                      <p className="font-medium text-gray-900">{volunteer.ageRange || "—"}</p>
                    </div>
                    <div>
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Ciudad</span>
                      <p className="font-medium text-gray-900">{volunteer.city || "—"}</p>
                    </div>
                    <div>
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Ocupación</span>
                      <p className="font-medium text-gray-900">{volunteer.occupation || "—"}</p>
                    </div>
                    <div>
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eb0028]">Estado</span>
                      <p className="font-medium text-gray-900">{volunteerStatusMeta(volunteer.status).label}</p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-white bg-white p-4 text-sm shadow-sm lg:col-span-2">
                    <div>
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Áreas de apoyo</span>
                      <p className="font-medium text-gray-900">{Array.isArray(volunteer.areas) && volunteer.areas.length ? volunteer.areas.join(" / ") : "—"}</p>
                    </div>
                    <div>
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Habilidades</span>
                      <p className="font-medium text-gray-900">{Array.isArray(volunteer.skills) && volunteer.skills.length ? volunteer.skills.join(" / ") : "—"}</p>
                    </div>
                    {isVolunteerExpanded ? (
                      <>
                        <div>
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Disponibilidad</span>
                          <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`volunteer-${volunteer.id}`, "availabilityText", volunteer.availabilityText || "—")}</div>
                        </div>
                        <div>
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Detalles de apoyo</span>
                          <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`volunteer-${volunteer.id}`, "areaDetailsText", volunteer.areaDetailsText || "—")}</div>
                        </div>
                        <div>
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Motivación</span>
                          <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`volunteer-${volunteer.id}`, "motivation", volunteer.motivation || "—")}</div>
                        </div>
                        <div>
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Experiencia previa</span>
                          <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`volunteer-${volunteer.id}`, "experience", volunteer.experience || "—")}</div>
                        </div>
                        <div>
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Equipo o recursos</span>
                          <div className="text-sm leading-relaxed text-gray-700">{renderExpandableText(`volunteer-${volunteer.id}`, "resources", volunteer.resources || "—")}</div>
                        </div>
                        <div>
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Redes o links</span>
                          <div className="text-sm leading-relaxed text-gray-700">
                            {Array.isArray(volunteer.socialLinks) && volunteer.socialLinks.length ? (
                              <div className="flex flex-wrap gap-2">
                                {volunteer.socialLinks.map((item: any, index: number) => {
                                  const rawUrl = typeof item === "string" ? item : item?.url;
                                  const platform = typeof item === "string" ? "Enlace" : item?.platform || "Enlace";
                                  if (!rawUrl) return null;

                                  return (
                                    <a
                                      key={`${platform}-${rawUrl}-${index}`}
                                      href={ensureProtocol(rawUrl)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700 transition hover:bg-sky-100"
                                    >
                                      {platform}
                                    </a>
                                  );
                                })}
                              </div>
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedVolunteerCards((prev) => ({ ...prev, [volunteer.id]: !isVolunteerExpanded }))}
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
                  >
                    {isVolunteerExpanded ? "Mostrar menos" : "Mostrar más"}
                  </button>

                  <div ref={statusMenuFor === volunteer.id ? statusMenuRef : undefined} className="relative">
                    <button
                      type="button"
                      onClick={() => setStatusMenuFor(statusMenuFor === volunteer.id ? null : volunteer.id)}
                      className={`inline-flex items-center rounded-md border px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${volunteerStatusMeta(volunteer.status).className}`}
                    >
                      <span className={`mr-2 h-2 w-2 rounded-full shadow-inner ${volunteerStatusMeta(volunteer.status).dot}`} />
                      Estado: {volunteerStatusMeta(volunteer.status).label} ▾
                    </button>

                    {statusMenuFor === volunteer.id ? (
                      <div className="absolute bottom-full right-0 z-50 mb-2 w-52 rounded-xl border border-gray-200 bg-white p-2 text-black shadow-[0_14px_40px_rgba(0,0,0,0.15)]">
                        <button onClick={() => updateStatusForSingle(volunteer.id, "Pendiente", "volunteer")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-50">
                          <span className="h-2.5 w-2.5 rounded-full bg-gray-400 shadow-sm" /> Pendiente
                        </button>
                        <button onClick={() => updateStatusForSingle(volunteer.id, "En revision", "volunteer")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-blue-700 transition-colors hover:bg-blue-50">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm" /> En revision
                        </button>
                        <button onClick={() => updateStatusForSingle(volunteer.id, "Aprobado", "volunteer")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-700 transition-colors hover:bg-emerald-50">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" /> Aprobado
                        </button>
                        <button onClick={() => updateStatusForSingle(volunteer.id, "Rechazado", "volunteer")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--color-ted-red)] transition-colors hover:bg-red-50">
                          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-ted-red)] shadow-sm" /> Rechazado
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            );})}
          </section>
        </div>

        <div className={activePanel === "page" ? "block" : "hidden"}>
          <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-white shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
            <div>
              <h2 className="text-2xl font-bold">Editor de Pagina</h2>
              <p className="mt-3 text-sm text-gray-300">Configura envíos masivos para la comunidad del newsletter desde este módulo.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <h3 className="text-lg font-semibold text-white">Enviar actualización a contactos del newsletter</h3>
              <p className="mt-1 text-xs text-gray-400">Esta acción crea y envía una campaña en Mailchimp al audience configurado.</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-400">Asunto</label>
                  <input
                    value={newsletterSubject}
                    onChange={(e) => setNewsletterSubject(e.target.value)}
                    placeholder="Ej. Novedades TEDx de esta semana"
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-ted-red)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-400">Titular</label>
                  <input
                    value={newsletterHeadline}
                    onChange={(e) => setNewsletterHeadline(e.target.value)}
                    placeholder="Titular principal del correo"
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-ted-red)]"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-400">Mensaje</label>
                <textarea
                  value={newsletterMessageText}
                  onChange={(e) => setNewsletterMessageText(e.target.value)}
                  rows={7}
                  placeholder="Escribe el contenido. Cada salto de línea se verá como párrafo en el correo."
                  className="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-ted-red)]"
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSendNewsletterUpdate}
                  disabled={newsletterSending}
                  className="rounded-full bg-[var(--color-ted-red)] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {newsletterSending ? "Enviando campaña..." : "Enviar actualización"}
                </button>
                {newsletterFeedback ? (
                  <p className="text-xs font-medium text-gray-200">{newsletterFeedback}</p>
                ) : null}
              </div>
            </div>
          </section>
        </div>

      </div>

      {editingRecord ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/80 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-10">
          <div className="w-full max-w-4xl max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-3xl border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-5rem)]">
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-ted-red)]">Editar registro</p>

                <h3 className="mt-1 text-xl font-bold text-gray-900">{editingRecord.kind === "speaker" ? "Ponente" : "Sponsor"}</h3>
              </div>
              <button
                type="button"
                onClick={() => { setEditingRecord(null); setEditDraft({}); setEditError(""); }}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Nombre / Empresa</label>
                  <input value={editDraft.nombre ?? editDraft.companyName ?? ""} onChange={(e) => updateEditField(editingRecord.kind === "speaker" ? "nombre" : "companyName", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Correo</label>
                    <input value={editDraft.correo ?? editDraft.email ?? ""} onChange={(e) => updateEditField(editingRecord.kind === "speaker" ? "correo" : "email", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Teléfono</label>
                    <input value={editDraft.telefono ?? editDraft.phone ?? ""} onChange={(e) => updateEditField(editingRecord.kind === "speaker" ? "telefono" : "phone", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Estatus</label>
                  <select value={editDraft.status ?? "Pendiente"} onChange={(e) => updateEditField("status", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]">
                    {editingRecord.kind === "speaker" ? (
                      <>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobada">Aprobada</option>
                        <option value="Rechazada">Rechazada</option>
                        <option value="Reserva">Reserva</option>
                      </>
                    ) : (
                      <>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En contacto">En contacto</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="No aprobado">No aprobado</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Notas</label>
                  <textarea value={editDraft.notes ?? editDraft.idea ?? editDraft.novedad ?? editDraft.eventInterest ?? ""} onChange={(e) => updateEditField(editingRecord.kind === "speaker" ? "idea" : "notes", e.target.value)} rows={6} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Campos rápidos</p>
                {editingRecord.kind === "speaker" ? (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Título de la charla</label>
                      <input value={editDraft.tituloCharla ?? ""} onChange={(e) => updateEditField("tituloCharla", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">LinkedIn</label>
                      <input value={editDraft.linkedin ?? ""} onChange={(e) => updateEditField("linkedin", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Video Pitch</label>
                      <input value={editDraft.videoLink ?? ""} onChange={(e) => updateEditField("videoLink", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Sitio web</label>
                      <input value={editDraft.website ?? ""} onChange={(e) => updateEditField("website", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Tipo de patrocinio</label>
                      <select value={editDraft.sponsorshipType ?? ""} onChange={(e) => updateEditField("sponsorshipType", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]">
                        <option value="">—</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="especie">En especie</option>
                        <option value="personalizado">Personalizado</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">Propuesta</label>
                      <textarea value={editDraft.customProposal ?? editDraft.inKindDescription ?? editDraft.budgetRange ?? ""} onChange={(e) => updateEditField(editDraft.sponsorshipType === "especie" ? "inKindDescription" : editDraft.sponsorshipType === "efectivo" ? "budgetRange" : "customProposal", e.target.value)} rows={5} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {editError ? <div className="mx-6 mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{editError}</div> : null}

            <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <button type="button" onClick={() => { setEditingRecord(null); setEditDraft({}); setEditError(""); }} className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400">
                Cancelar
              </button>
              <button type="button" onClick={saveEdit} disabled={editSaving} className="rounded-full bg-[var(--color-ted-red)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(235,0,40,0.3)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
                {editSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {approvingSpeaker ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/80 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-10">
          <div className="w-full max-w-5xl max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-3xl border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-5rem)]">
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-ted-red)]">Confirmar antes de aprobar</p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">Ponencia aprobada</h3>
              </div>
              <button
                type="button"
                onClick={() => { setApprovingSpeaker(null); setApprovalDraft({}); setApprovalError(""); }}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-5">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">1. Foto de perfil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleApprovalPhotoChange(e.target.files?.[0] ?? null)}
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-ted-red)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-[var(--color-ted-red)]"
                  />
                  <p className="mt-2 text-xs text-gray-500">Selecciona un archivo desde tu computadora. Se subirá a Firebase Storage al aprobar.</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgba(235,0,40,0.18),rgba(0,0,0,0.6))] text-center text-white shadow-inner">
                    {approvalPhotoPreview ? (
                      <img src={approvalPhotoPreview} alt={approvalDraft.name || "Foto de perfil"} className="h-full w-full object-cover" />
                    ) : (
                      <div>
                        <p className="text-4xl font-black tracking-[-0.08em]">{String(approvalDraft.name || "TD").split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase()).join("") || "TD"}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/70">Vista previa</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">2. Confirmar nombre completo</label>
                  <input
                    value={approvalDraft.name ?? ""}
                    onChange={(e) => updateApprovalField("name", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">3. Confirmar ocupación / perfil</label>
                  <input
                    value={approvalDraft.profile ?? ""}
                    onChange={(e) => updateApprovalField("profile", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">4. Confirmar nombre de la ponencia</label>
                  <input
                    value={approvalDraft.title ?? ""}
                    onChange={(e) => updateApprovalField("title", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Descripción de la ponencia</p>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">5. Idea central</label>
                  <textarea
                    value={approvalDraft.centralIdea ?? ""}
                    onChange={(e) => updateApprovalField("centralIdea", e.target.value)}
                    rows={6}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">6. Descripción</label>
                  <textarea
                    value={approvalDraft.description ?? ""}
                    onChange={(e) => updateApprovalField("description", e.target.value)}
                    rows={7}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]"
                  />
                </div>

                {approvalError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{approvalError}</div> : null}

                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                  Se aprobará la ponencia usando estos datos y se actualizará el estado a <span className="font-semibold text-green-700">Aprobada</span>.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <button type="button" onClick={() => { setApprovingSpeaker(null); setApprovalDraft({}); setApprovalError(""); }} className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400">
                Cancelar
              </button>
              <button type="button" onClick={confirmApproval} disabled={approvalSaving} className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(34,197,94,0.25)] transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">
                {approvalSaving ? "Aprobando..." : "Confirmar y aprobar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {mounted && approvingSponsor
        ? createPortal(
        <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm">
          <div className="absolute left-1/2 top-1/2 w-[min(calc(100%-2rem),68rem)] max-h-[80dvh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:max-h-[84dvh] sm:w-[min(calc(100%-3rem),68rem)]">
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-ted-red)]">Confirmar antes de finalizar</p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">Sponsor finalizado</h3>
              </div>
              <button
                type="button"
                onClick={() => { setApprovingSponsor(null); setSponsorApprovalDraft({}); setSponsorApprovalError(""); }}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
              >
                Cerrar
              </button>
            </div>

            <div className="px-5 py-5">
              <div className="mx-auto max-w-3xl space-y-5">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-gray-500">1. Logo / imagen del sponsor</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSponsorLogoChange(e.target.files?.[0] ?? null)}
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-ted-red)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-[var(--color-ted-red)]"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1">
                      {sponsorLogoFile ? sponsorLogoFile.name : "Sin archivo seleccionado"}
                    </span>
                    {sponsorLogoFile ? (
                      <button
                        type="button"
                        onClick={() => handleSponsorLogoChange(null)}
                        className="rounded-full border border-gray-300 bg-white px-2.5 py-1 font-semibold text-gray-700 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
                      >
                        Quitar imagen
                      </button>
                    ) : null}
                    {sponsorLogoFile ? (
                      <button
                        type="button"
                        onClick={() => setSponsorCropEditorOpen(true)}
                        className="rounded-full border border-gray-300 bg-white px-2.5 py-1 font-semibold text-gray-700 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
                      >
                        Editar recorte
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-500">Nivel de sponsor</label>
                  <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => updateSponsorApprovalField("sponsorLevel", "sponsor")}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        String(sponsorApprovalDraft.sponsorLevel || "apoyo").toLowerCase() === "sponsor"
                          ? "bg-[var(--color-ted-red)] text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Sponsor (logo grande)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSponsorApprovalField("sponsorLevel", "apoyo")}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        String(sponsorApprovalDraft.sponsorLevel || "apoyo").toLowerCase() === "apoyo"
                          ? "bg-[var(--color-ted-red)] text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Apoyo (logo pequeño)
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-500">Formato del logo</label>
                  <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setSponsorAspectMode("square")}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        sponsorAspectMode === "square" ? "bg-[var(--color-ted-red)] text-white" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Cuadrado
                    </button>
                    <button
                      type="button"
                      onClick={() => setSponsorAspectMode("rectangular")}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        sponsorAspectMode === "rectangular" ? "bg-[var(--color-ted-red)] text-white" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Rectangular
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <div className={`mx-auto flex w-full max-w-[260px] items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgba(235,0,40,0.18),rgba(0,0,0,0.6))] text-center text-white shadow-inner ${sponsorAspectMode === "square" ? "aspect-square" : "aspect-[16/9]"}`}>
                    {sponsorLogoPreview ? (
                      <img
                        src={sponsorLogoPreview}
                        alt={sponsorApprovalDraft.companyName || "Logo del sponsor"}
                        className="h-full w-full object-cover"
                        style={{
                          transform: `scale(${sponsorLogoZoom})`,
                          transformOrigin: `${sponsorLogoOffsetX}% ${sponsorLogoOffsetY}%`,
                        }}
                      />
                    ) : (
                      <div>
                        <p className="text-4xl font-black tracking-[-0.08em]">{String(sponsorApprovalDraft.companyName || "SP").split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase()).join("") || "SP"}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/70">Vista previa</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-gray-500">2. Confirmar nombre de la empresa</label>
                  <input value={sponsorApprovalDraft.companyName ?? ""} onChange={(e) => updateSponsorApprovalField("companyName", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-gray-500">3. URL destino al tocar el logo (opcional)</label>
                  <input value={sponsorApprovalDraft.website ?? ""} onChange={(e) => updateSponsorApprovalField("website", e.target.value)} placeholder="https://ejemplo.com" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-ted-red)]" />
                </div>
                {sponsorApprovalError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{sponsorApprovalError}</div> : null}

                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                  Se guardará el logo recortado, se confirmará el nivel y se publicará en home con estado <span className="font-semibold text-emerald-700">Finalizado</span>.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <button type="button" onClick={() => { setApprovingSponsor(null); setSponsorApprovalDraft({}); setSponsorApprovalError(""); setSponsorCropDragState(null); setSponsorCropEditorOpen(false); }} className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400">
                Cancelar
              </button>
              <button type="button" onClick={confirmSponsorApproval} disabled={sponsorApprovalSaving} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(16,185,129,0.25)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                {sponsorApprovalSaving ? "Guardando..." : "Confirmar y finalizar"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
        )
        : null}

      {mounted && approvingSponsor && sponsorCropEditorOpen
        ? createPortal(
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm">
          <div className="absolute left-1/2 top-1/2 w-[min(calc(100%-2rem),38rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3">
              <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-gray-700">Editar recorte</h4>
              <button
                type="button"
                onClick={() => setSponsorCropEditorOpen(false)}
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
              >
                Cerrar
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div
                className={`mx-auto flex w-full max-w-[420px] items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgba(235,0,40,0.18),rgba(0,0,0,0.6))] text-center text-white shadow-inner ${sponsorAspectMode === "square" ? "aspect-square" : "aspect-[16/9]"} ${sponsorLogoPreview ? "cursor-grab active:cursor-grabbing" : ""}`}
                onPointerDown={handleSponsorCropPointerDown}
                onPointerMove={handleSponsorCropPointerMove}
                onPointerUp={handleSponsorCropPointerEnd}
                onPointerCancel={handleSponsorCropPointerEnd}
                onWheel={handleSponsorCropWheel as any}
              >
                {sponsorLogoPreview ? (
                  <img
                    src={sponsorLogoPreview}
                    alt={sponsorApprovalDraft.companyName || "Logo del sponsor"}
                    className="pointer-events-none h-full w-full select-none object-cover"
                    draggable={false}
                    style={{
                      transform: `translate(${(sponsorLogoOffsetX - 50) * 0.6}%, ${(sponsorLogoOffsetY - 50) * 0.6}%) scale(${sponsorLogoZoom})`,
                      transformOrigin: "center center",
                    }}
                  />
                ) : (
                  <p className="text-sm text-white/80">Selecciona una imagen para recortar.</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Zoom ({sponsorLogoZoom.toFixed(2)}x)
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={sponsorLogoZoom}
                  onChange={(e) => setSponsorLogoZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetSponsorCropControls}
                  className="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
                >
                  Recentrar
                </button>
                <button
                  type="button"
                  onClick={() => setSponsorCropEditorOpen(false)}
                  className="rounded-full bg-[var(--color-ted-red)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-95"
                >
                  Usar recorte
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
        )
        : null}

      {volunteerImageViewer && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 px-4 py-6 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label={`Foto de ${volunteerImageViewer.name}`}
              onPointerDown={() => setVolunteerImageViewer(null)}
              onClick={() => setVolunteerImageViewer(null)}
            >
              <div
                className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 text-white">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Foto de voluntariado</p>
                    <h3 className="mt-1 text-lg font-semibold">{volunteerImageViewer.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVolunteerImageViewer(null)}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="bg-black p-4 sm:p-6">
                  <Image
                    src={volunteerImageViewer.src}
                    alt={volunteerImageViewer.name}
                    width={1600}
                    height={1600}
                    className="mx-auto max-h-[75vh] w-auto rounded-2xl object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <footer className="border-t border-gray-800 bg-black px-6 py-8 text-sm text-gray-300 relative z-10 mt-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="hidden md:block">
            <p className="font-mono text-xs text-gray-500 mb-1">ESTA ES UNA VISTA PRIVADA (ADMINISTRADOR)</p>
            <p>Este evento TEDx independiente se opera bajo licencia de TED.</p>
            <p className="mt-2 text-xs text-gray-500">
              Más información sobre el programa oficial TEDx:
              <a href="https://www.ted.com/about/programs-initiatives/tedx-program" target="_blank" rel="noreferrer" className="ml-1 font-semibold text-[var(--color-ted-red)] underline underline-offset-4">
                ted.com/about/programs-initiatives/tedx-program
              </a>
            </p>
          </div>

          <div className="md:hidden text-center">
            <p className="font-mono text-[10px] text-gray-500 mb-2">VISTA DE ADMINISTRADOR</p>
            <p className="text-xs">
              Este evento TEDx independiente se opera bajo licencia de TED.
            </p>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-end">
            <a
              href="https://instagram.com/tedxavenidabolivar"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-gray-800 bg-gray-900 p-2 text-gray-400 transition hover:border-[var(--color-ted-red)] hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <button
              type="button"
              onClick={() => copyEmail("contacto@tedxavenidabolivar.com")}
              aria-label="Copiar correo"
              className="rounded-full border border-gray-800 bg-gray-900 p-2 text-gray-400 transition hover:border-[var(--color-ted-red)] hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
