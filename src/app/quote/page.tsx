"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Printer,
  Zap,
  PenTool,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Check,
  FileText,
  Droplets,
  Shield,
  Thermometer,
  Sun,
  TreePine,
  Gem,
  ShieldCheck,
  Box,
  Settings,
  Scissors,
  User,
  Mail,
  Phone,
  Building,
  DollarSign,
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap as ZapIcon,
  CalendarClock,
} from "lucide-react";

/* ==========================================================
   Types
   ========================================================== */
interface FormData {
  /* Step 1 */
  serviceType: string;
  /* Step 2 */
  description: string;
  quantity: string;
  timeline: string;
  /* Step 2b - 3D Printing */
  material: string;
  /* Step 2c - Laser */
  laserMaterial: string;
  laserDimensions: string;
  laserDesignDesc: string;
  /* Step 3 */
  files: File[];
  /* Step 4 */
  name: string;
  email: string;
  phone: string;
  company: string;
  budget: string;
  hearAbout: string;
}

/* ==========================================================
   QUOTE PAGE COMPONENT
   ========================================================== */
export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    serviceType: "",
    description: "",
    quantity: "1",
    timeline: "",
    material: "",
    laserMaterial: "",
    laserDimensions: "",
    laserDesignDesc: "",
    files: [],
    name: "",
    email: "",
    phone: "",
    company: "",
    budget: "",
    hearAbout: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- Helpers ---------- */
  const updateField = (field: keyof FormData, value: string | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const totalSteps = 5;

  const getStepForDisplay = () => {
    if (step <= 2) return step;
    if (step === 3) return 2; // sub-step of 2
    if (step === 4) return 3; // file upload
    if (step === 5) return 4; // contact info
    return 5; // review
  };

  /* Map actual steps to progress */
  const progressSteps = [
    { num: 1, label: "Service" },
    { num: 2, label: "Details" },
    { num: 3, label: "Files" },
    { num: 4, label: "Contact" },
    { num: 5, label: "Review" },
  ];

  /* Actual step flow:
     1 = Service selection
     2 = Project details
     3 = Material sub-step (2b for 3D, 2c for laser)
     4 = File upload
     5 = Contact info
     6 = Review & submit
  */
  const getProgressPercent = () => {
    const map: Record<number, number> = { 1: 0, 2: 20, 3: 40, 4: 55, 5: 75, 6: 100 };
    return map[step] || 0;
  };

  const hasMaterialStep = formData.serviceType === "3d-printing" || formData.serviceType === "laser-engraving";

  /* ---------- Validation ---------- */
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.serviceType) newErrors.serviceType = "Please select a service type";
    }
    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = "Please describe your project";
      if (!formData.timeline) newErrors.timeline = "Please select a timeline";
    }
    if (step === 3) {
      if (formData.serviceType === "3d-printing" && !formData.material) {
        newErrors.material = "Please select a material";
      }
      if (formData.serviceType === "laser-engraving" && !formData.laserMaterial) {
        newErrors.laserMaterial = "Please select a material to engrave on";
      }
    }
    if (step === 5) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    if (step === 2 && hasMaterialStep) {
      setStep(3);
    } else if (step === 2 && !hasMaterialStep) {
      setStep(4); // skip material step
    } else if (step === 3) {
      setStep(4);
    } else {
      setStep((s) => Math.min(s + 1, 6));
    }
  };

  const prevStep = () => {
    if (step === 4 && hasMaterialStep) {
      setStep(3);
    } else if (step === 4 && !hasMaterialStep) {
      setStep(2);
    } else {
      setStep((s) => Math.max(s - 1, 1));
    }
  };

  /* ---------- File handling ---------- */
  const acceptedTypes = ".stl,.obj,.3mf,.svg,.dxf,.ai,.pdf,.jpg,.jpeg,.png";

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const filesArray = Array.from(newFiles);
      updateField("files", [...formData.files, ...filesArray]);
    },
    [formData.files]
  );

  const removeFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    updateField("files", newFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  /* ---------- Upload files to /api/upload ---------- */
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const fd = new globalThis.FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        throw new Error(`Failed to upload file: ${file.name}`);
      }
      const json = await res.json();
      if (json.success && json.data?.url) {
        urls.push(json.data.url);
      } else {
        throw new Error(`Upload response missing URL for: ${file.name}`);
      }
    }
    return urls;
  };

  /* ---------- Map form serviceType to API enum ---------- */
  const mapServiceType = (value: string): string => {
    const map: Record<string, string> = {
      "3d-printing": "PRINTING_3D",
      "laser-engraving": "LASER_ENGRAVING",
      "design-services": "DESIGN",
      "consultation": "CONSULTATION",
    };
    return map[value] || value;
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    setStatus("sending");
    try {
      // 1. Upload files first (if any)
      let fileUrls: string[] = [];
      if (formData.files.length > 0) {
        fileUrls = await uploadFiles(formData.files);
      }

      // 2. Build description with laser-specific details appended
      let fullDescription = formData.description;
      if (formData.serviceType === "laser-engraving") {
        if (formData.laserMaterial) {
          fullDescription += `\n\nLaser Material: ${formData.laserMaterial}`;
        }
        if (formData.laserDimensions) {
          fullDescription += `\nDimensions: ${formData.laserDimensions}`;
        }
        if (formData.laserDesignDesc) {
          fullDescription += `\nDesign Description: ${formData.laserDesignDesc}`;
        }
      }

      // 3. Map form fields to API-expected field names and values
      const submitData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone || undefined,
        company: formData.company || undefined,
        serviceType: mapServiceType(formData.serviceType),
        description: fullDescription,
        material: formData.material || undefined,
        quantity: parseInt(formData.quantity, 10) || 1,
        fileUrls,
        timeline: formData.timeline.toUpperCase() || "STANDARD",
        budget: formData.budget || undefined,
        referralSource: formData.hearAbout || undefined,
      };

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  /* ---------- Data for selections ---------- */
  const serviceTypes = [
    {
      id: "3d-printing",
      icon: Printer,
      title: "3D Printing",
      description: "Custom 3D printed parts using FDM technology",
    },
    {
      id: "laser-engraving",
      icon: Zap,
      title: "Laser Engraving",
      description: "Precision engraving and cutting on various materials",
    },
    {
      id: "design-services",
      icon: PenTool,
      title: "Design Services",
      description: "3D modeling, CAD, file repair, and design consultation",
    },
    {
      id: "consultation",
      icon: MessageSquare,
      title: "Consultation",
      description: "Free project consultation to discuss your needs",
    },
  ];

  const timelines = [
    { id: "standard", icon: Clock, label: "Standard", desc: "5-7 business days" },
    { id: "rush", icon: ZapIcon, label: "Rush", desc: "2-3 business days" },
    { id: "flexible", icon: CalendarClock, label: "Flexible", desc: "No rush, best price" },
  ];

  const printMaterials = [
    {
      id: "pla",
      name: "PLA",
      nickname: "The Everyday Hero",
      icon: Droplets,
      borderColor: "rgba(34,197,94,0.3)",
      bestFor: "Prototypes, decorative items, display models",
      props: ["Eco-friendly", "Great finish", "Easy to print"],
    },
    {
      id: "petg",
      name: "PETG",
      nickname: "The All-Rounder",
      icon: Shield,
      borderColor: "rgba(59,130,246,0.3)",
      bestFor: "Functional parts, outdoor use, food containers",
      props: ["Strong & flexible", "Chemical resistant", "Food-safe options"],
    },
    {
      id: "abs",
      name: "ABS",
      nickname: "The Tough One",
      icon: Thermometer,
      borderColor: "rgba(239,68,68,0.3)",
      bestFor: "Automotive parts, enclosures, functional prototypes",
      props: ["Heat resistant", "Impact resistant", "Acetone smoothable"],
    },
    {
      id: "asa",
      name: "ASA",
      nickname: "The Outdoor Champion",
      icon: Sun,
      borderColor: "rgba(234,179,8,0.3)",
      bestFor: "Outdoor fixtures, garden items, signage",
      props: ["UV resistant", "Weatherproof", "Color stable outdoors"],
    },
  ];

  const laserMaterials = [
    { id: "wood", name: "Wood", icon: TreePine },
    { id: "acrylic", name: "Acrylic", icon: Gem },
    { id: "leather", name: "Leather", icon: ShieldCheck },
    { id: "glass", name: "Glass", icon: Box },
    { id: "metal", name: "Metal", icon: Settings },
    { id: "fabric", name: "Fabric", icon: Scissors },
  ];

  /* ---------- Shared styles ---------- */
  const inputStyle: React.CSSProperties = {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    color: "#fff",
    outline: "none",
  };

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#D4881C";
    e.currentTarget.style.boxShadow = "0 0 0 1px #D4881C";
  };

  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#2a2a2a";
    e.currentTarget.style.boxShadow = "none";
  };

  /* ---------- Animation variants ---------- */
  const pageVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  /* ==========================================================
     RENDER SUCCESS
     ========================================================== */
  if (status === "success") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: "rgb(74,222,128)" }} />
          </div>
          <h1
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Quote Request Submitted!
          </h1>
          <p className="text-lg mb-8" style={{ color: "#9ca3af" }}>
            Thank you for your interest! We will review your request and get back to you
            within 24 hours with a detailed quote.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 font-semibold rounded-lg transition-all duration-300"
            style={{
              backgroundColor: "#D4881C",
              color: "#000",
            }}
          >
            Back to Home
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    );
  }

  /* ==========================================================
     RENDER FORM
     ========================================================== */
  return (
    <div className="relative overflow-hidden">
      {/* ====================================================
          HERO + PROGRESS
          ==================================================== */}
      <section className="pt-12 pb-8 px-6" style={{ backgroundColor: "#000" }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1
              className="text-4xl md:text-5xl font-bold gold-gradient-text mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Get a Free Quote
            </h1>
            <p style={{ color: "#9ca3af" }}>
              Tell us about your project and we will get back to you within 24 hours.
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between mb-3">
              {progressSteps.map((ps, i) => {
                const isActive =
                  (step === 1 && i === 0) ||
                  (step === 2 && i === 1) ||
                  (step === 3 && i === 1) ||
                  (step === 4 && i === 2) ||
                  (step === 5 && i === 3) ||
                  (step === 6 && i === 4);
                const isPast =
                  (i === 0 && step > 1) ||
                  (i === 1 && step > 3) ||
                  (i === 2 && step > 4) ||
                  (i === 3 && step > 5);

                return (
                  <div key={ps.num} className="flex flex-col items-center flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all duration-300"
                      style={{
                        backgroundColor: isActive || isPast ? "#D4881C" : "#2a2a2a",
                        color: isActive || isPast ? "#000" : "#6b7280",
                      }}
                    >
                      {isPast ? <Check className="w-4 h-4" /> : ps.num}
                    </div>
                    <span
                      className="text-xs hidden sm:block"
                      style={{ color: isActive ? "#D4881C" : "#6b7280" }}
                    >
                      {ps.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#2a2a2a" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: "#D4881C" }}
                animate={{ width: `${getProgressPercent()}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          FORM STEPS
          ==================================================== */}
      <section className="pb-24 px-6" style={{ backgroundColor: "#000" }}>
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {/* ====== STEP 1: SERVICE SELECTION ====== */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  What can we help you with?
                </h2>
                <p className="mb-8 text-sm" style={{ color: "#9ca3af" }}>
                  Select the service that best matches your project.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {serviceTypes.map((svc) => (
                    <motion.button
                      key={svc.id}
                      type="button"
                      onClick={() => updateField("serviceType", svc.id)}
                      className="text-left rounded-xl p-6 transition-all"
                      style={{
                        backgroundColor: formData.serviceType === svc.id ? "rgba(212,136,28,0.1)" : "#1a1a1a",
                        border: `2px solid ${formData.serviceType === svc.id ? "#D4881C" : "#2a2a2a"}`,
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{
                          backgroundColor: formData.serviceType === svc.id
                            ? "rgba(212,136,28,0.2)"
                            : "rgba(212,136,28,0.1)",
                        }}
                      >
                        <svc.icon
                          className="w-6 h-6"
                          style={{ color: formData.serviceType === svc.id ? "#E8A83E" : "#D4881C" }}
                        />
                      </div>
                      <h3 className="text-white font-semibold mb-1">{svc.title}</h3>
                      <p className="text-xs" style={{ color: "#6b7280" }}>{svc.description}</p>
                    </motion.button>
                  ))}
                </div>

                {errors.serviceType && (
                  <p className="text-sm mt-3 flex items-center gap-1" style={{ color: "rgb(248,113,113)" }}>
                    <AlertCircle className="w-4 h-4" /> {errors.serviceType}
                  </p>
                )}
              </motion.div>
            )}

            {/* ====== STEP 2: PROJECT DETAILS ====== */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Tell us about your project
                </h2>
                <p className="mb-8 text-sm" style={{ color: "#9ca3af" }}>
                  The more details you provide, the more accurate our quote will be.
                </p>

                <div className="space-y-5">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Project Description <span style={{ color: "#D4881C" }}>*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      rows={5}
                      placeholder="Describe what you need printed, engraved, or designed. Include dimensions, colors, or any specific requirements..."
                      className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600 resize-none"
                      style={inputStyle}
                      onFocus={focusInput}
                      onBlur={blurInput}
                    />
                    {errors.description && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "rgb(248,113,113)" }}>
                        <AlertCircle className="w-3 h-3" /> {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => updateField("quantity", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm"
                      style={inputStyle}
                      onFocus={focusInput}
                      onBlur={blurInput}
                    />
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Timeline <span style={{ color: "#D4881C" }}>*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {timelines.map((tl) => (
                        <button
                          key={tl.id}
                          type="button"
                          onClick={() => updateField("timeline", tl.id)}
                          className="rounded-lg p-4 text-center transition-all"
                          style={{
                            backgroundColor: formData.timeline === tl.id ? "rgba(212,136,28,0.1)" : "#1a1a1a",
                            border: `2px solid ${formData.timeline === tl.id ? "#D4881C" : "#2a2a2a"}`,
                          }}
                        >
                          <tl.icon
                            className="w-5 h-5 mx-auto mb-2"
                            style={{ color: formData.timeline === tl.id ? "#D4881C" : "#6b7280" }}
                          />
                          <p
                            className="text-sm font-medium"
                            style={{ color: formData.timeline === tl.id ? "#D4881C" : "#fff" }}
                          >
                            {tl.label}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{tl.desc}</p>
                        </button>
                      ))}
                    </div>
                    {errors.timeline && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "rgb(248,113,113)" }}>
                        <AlertCircle className="w-3 h-3" /> {errors.timeline}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ====== STEP 3: MATERIAL SELECTION (Sub-step) ====== */}
            {step === 3 && formData.serviceType === "3d-printing" && (
              <motion.div
                key="step3-3d"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Choose Your Material
                </h2>
                <p className="mb-8 text-sm" style={{ color: "#9ca3af" }}>
                  Each material has unique properties. Select the one that best fits your use case.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {printMaterials.map((mat) => (
                    <motion.button
                      key={mat.id}
                      type="button"
                      onClick={() => updateField("material", mat.id)}
                      className="text-left rounded-xl p-5 transition-all"
                      style={{
                        backgroundColor: formData.material === mat.id ? "rgba(212,136,28,0.08)" : "#1a1a1a",
                        border: `2px solid ${formData.material === mat.id ? "#D4881C" : mat.borderColor}`,
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <mat.icon className="w-6 h-6" style={{ color: "#D4881C" }} />
                        <div>
                          <h3 className="text-white font-bold">{mat.name}</h3>
                          <p className="text-xs italic" style={{ color: "#D4881C" }}>{mat.nickname}</p>
                        </div>
                        {formData.material === mat.id && (
                          <Check className="w-5 h-5 ml-auto" style={{ color: "#D4881C" }} />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {mat.props.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 text-xs rounded-full"
                            style={{
                              backgroundColor: "rgba(212,136,28,0.1)",
                              color: "#E8A83E",
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: "#6b7280" }}>
                        Best for: {mat.bestFor}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {errors.material && (
                  <p className="text-sm mt-3 flex items-center gap-1" style={{ color: "rgb(248,113,113)" }}>
                    <AlertCircle className="w-4 h-4" /> {errors.material}
                  </p>
                )}
              </motion.div>
            )}

            {step === 3 && formData.serviceType === "laser-engraving" && (
              <motion.div
                key="step3-laser"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Laser Engraving Details
                </h2>
                <p className="mb-8 text-sm" style={{ color: "#9ca3af" }}>
                  Tell us about the material and design for your engraving project.
                </p>

                <div className="space-y-6">
                  {/* Material to engrave on */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Material to Engrave On <span style={{ color: "#D4881C" }}>*</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {laserMaterials.map((mat) => (
                        <button
                          key={mat.id}
                          type="button"
                          onClick={() => updateField("laserMaterial", mat.id)}
                          className="rounded-lg p-3 text-center transition-all"
                          style={{
                            backgroundColor: formData.laserMaterial === mat.id ? "rgba(212,136,28,0.1)" : "#1a1a1a",
                            border: `2px solid ${formData.laserMaterial === mat.id ? "#D4881C" : "#2a2a2a"}`,
                          }}
                        >
                          <mat.icon
                            className="w-5 h-5 mx-auto mb-1"
                            style={{ color: formData.laserMaterial === mat.id ? "#D4881C" : "#6b7280" }}
                          />
                          <p
                            className="text-xs font-medium"
                            style={{ color: formData.laserMaterial === mat.id ? "#D4881C" : "#d1d5db" }}
                          >
                            {mat.name}
                          </p>
                        </button>
                      ))}
                    </div>
                    {errors.laserMaterial && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "rgb(248,113,113)" }}>
                        <AlertCircle className="w-3 h-3" /> {errors.laserMaterial}
                      </p>
                    )}
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Dimensions (approximate)
                    </label>
                    <input
                      type="text"
                      value={formData.laserDimensions}
                      onChange={(e) => updateField("laserDimensions", e.target.value)}
                      placeholder='e.g. 6" x 4", 200mm x 150mm'
                      className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600"
                      style={inputStyle}
                      onFocus={focusInput}
                      onBlur={blurInput}
                    />
                  </div>

                  {/* Design description */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1.5">
                      Design / Text Description
                    </label>
                    <textarea
                      value={formData.laserDesignDesc}
                      onChange={(e) => updateField("laserDesignDesc", e.target.value)}
                      rows={3}
                      placeholder="Describe the text, logo, or artwork you want engraved..."
                      className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600 resize-none"
                      style={inputStyle}
                      onFocus={focusInput}
                      onBlur={blurInput}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ====== STEP 4: FILE UPLOAD ====== */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Upload Your Files
                </h2>
                <p className="mb-8 text-sm" style={{ color: "#9ca3af" }}>
                  Upload design files if you have them. This step is optional &mdash;
                  you can also describe your project and we will work with you.
                </p>

                {/* Drop zone */}
                <div
                  className="rounded-xl p-8 text-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: dragActive ? "rgba(212,136,28,0.08)" : "#1a1a1a",
                    border: `2px dashed ${dragActive ? "#D4881C" : "#2a2a2a"}`,
                  }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 mx-auto mb-4" style={{ color: "#D4881C" }} />
                  <p className="text-white font-medium mb-1">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>
                    Accepted: STL, OBJ, 3MF, SVG, DXF, AI, PDF, JPG, PNG
                  </p>
                </div>

                {/* File list */}
                {formData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-lg px-4 py-3"
                        style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5" style={{ color: "#D4881C" }} />
                          <div>
                            <p className="text-sm text-white">{file.name}</p>
                            <p className="text-xs" style={{ color: "#6b7280" }}>
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 rounded transition-colors"
                          style={{ color: "#6b7280" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(248,113,113)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs mt-4" style={{ color: "#4b5563" }}>
                  No files? No problem. Just describe your project in the previous step
                  and we can work from a description, sketch, or reference image.
                </p>
              </motion.div>
            )}

            {/* ====== STEP 5: CONTACT INFO ====== */}
            {step === 5 && (
              <motion.div
                key="step5"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Your Contact Information
                </h2>
                <p className="mb-8 text-sm" style={{ color: "#9ca3af" }}>
                  How can we reach you with your quote?
                </p>

                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-white mb-1.5">
                        <User className="w-4 h-4" style={{ color: "#D4881C" }} />
                        Name <span style={{ color: "#D4881C" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600"
                        style={inputStyle}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                      {errors.name && (
                        <p className="text-xs mt-1" style={{ color: "rgb(248,113,113)" }}>{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-white mb-1.5">
                        <Mail className="w-4 h-4" style={{ color: "#D4881C" }} />
                        Email <span style={{ color: "#D4881C" }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600"
                        style={inputStyle}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                      {errors.email && (
                        <p className="text-xs mt-1" style={{ color: "rgb(248,113,113)" }}>{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-white mb-1.5">
                        <Phone className="w-4 h-4" style={{ color: "#D4881C" }} />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="(423) 555-1234"
                        className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600"
                        style={inputStyle}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-white mb-1.5">
                        <Building className="w-4 h-4" style={{ color: "#D4881C" }} />
                        Company <span className="text-xs" style={{ color: "#6b7280" }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => updateField("company", e.target.value)}
                        placeholder="Company name"
                        className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600"
                        style={inputStyle}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-white mb-1.5">
                        <DollarSign className="w-4 h-4" style={{ color: "#D4881C" }} />
                        Budget <span className="text-xs" style={{ color: "#6b7280" }}>(optional)</span>
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => updateField("budget", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg text-sm"
                        style={{ ...inputStyle, color: formData.budget ? "#fff" : "#4b5563" }}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      >
                        <option value="">Select a range</option>
                        <option value="under-25">Under $25</option>
                        <option value="25-50">$25 - $50</option>
                        <option value="50-100">$50 - $100</option>
                        <option value="100-250">$100 - $250</option>
                        <option value="250-500">$250 - $500</option>
                        <option value="500+">$500+</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-white mb-1.5">
                        <HelpCircle className="w-4 h-4" style={{ color: "#D4881C" }} />
                        How did you hear about us?
                      </label>
                      <select
                        value={formData.hearAbout}
                        onChange={(e) => updateField("hearAbout", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg text-sm"
                        style={{ ...inputStyle, color: formData.hearAbout ? "#fff" : "#4b5563" }}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      >
                        <option value="">Select an option</option>
                        <option value="google">Google Search</option>
                        <option value="social-media">Social Media</option>
                        <option value="referral">Friend / Referral</option>
                        <option value="local">Local Event / Signage</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ====== STEP 6: REVIEW ====== */}
            {step === 6 && (
              <motion.div
                key="step6"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Review Your Quote Request
                </h2>
                <p className="mb-8 text-sm" style={{ color: "#9ca3af" }}>
                  Please verify all details before submitting.
                </p>

                <div className="space-y-4">
                  {/* Service */}
                  <div
                    className="rounded-xl p-5"
                    style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  >
                    <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: "#6b7280" }}>
                      Service Type
                    </p>
                    <p className="text-white font-medium capitalize">
                      {formData.serviceType.replace("-", " ")}
                    </p>
                  </div>

                  {/* Project Details */}
                  <div
                    className="rounded-xl p-5"
                    style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  >
                    <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: "#6b7280" }}>
                      Project Details
                    </p>
                    <p className="text-white text-sm mb-2">{formData.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span style={{ color: "#9ca3af" }}>
                        Qty: <span className="text-white">{formData.quantity}</span>
                      </span>
                      <span style={{ color: "#9ca3af" }}>
                        Timeline: <span className="text-white capitalize">{formData.timeline}</span>
                      </span>
                    </div>
                  </div>

                  {/* Material (if applicable) */}
                  {formData.serviceType === "3d-printing" && formData.material && (
                    <div
                      className="rounded-xl p-5"
                      style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                    >
                      <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: "#6b7280" }}>
                        Material
                      </p>
                      <p className="text-white font-medium uppercase">{formData.material}</p>
                    </div>
                  )}

                  {formData.serviceType === "laser-engraving" && (
                    <div
                      className="rounded-xl p-5"
                      style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                    >
                      <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: "#6b7280" }}>
                        Laser Engraving Details
                      </p>
                      <p className="text-white text-sm capitalize mb-1">Material: {formData.laserMaterial}</p>
                      {formData.laserDimensions && (
                        <p className="text-sm" style={{ color: "#9ca3af" }}>Dimensions: {formData.laserDimensions}</p>
                      )}
                      {formData.laserDesignDesc && (
                        <p className="text-sm" style={{ color: "#9ca3af" }}>Design: {formData.laserDesignDesc}</p>
                      )}
                    </div>
                  )}

                  {/* Files */}
                  <div
                    className="rounded-xl p-5"
                    style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  >
                    <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: "#6b7280" }}>
                      Files
                    </p>
                    {formData.files.length > 0 ? (
                      <ul className="space-y-1">
                        {formData.files.map((f, i) => (
                          <li key={i} className="text-sm text-white flex items-center gap-2">
                            <FileText className="w-4 h-4" style={{ color: "#D4881C" }} />
                            {f.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm" style={{ color: "#6b7280" }}>No files uploaded</p>
                    )}
                  </div>

                  {/* Contact */}
                  <div
                    className="rounded-xl p-5"
                    style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  >
                    <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: "#6b7280" }}>
                      Contact Information
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span style={{ color: "#6b7280" }}>Name: </span>
                        <span className="text-white">{formData.name}</span>
                      </div>
                      <div>
                        <span style={{ color: "#6b7280" }}>Email: </span>
                        <span className="text-white">{formData.email}</span>
                      </div>
                      {formData.phone && (
                        <div>
                          <span style={{ color: "#6b7280" }}>Phone: </span>
                          <span className="text-white">{formData.phone}</span>
                        </div>
                      )}
                      {formData.company && (
                        <div>
                          <span style={{ color: "#6b7280" }}>Company: </span>
                          <span className="text-white">{formData.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-3 rounded-lg mt-4"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
                  >
                    <AlertCircle className="w-5 h-5" style={{ color: "rgb(248,113,113)" }} />
                    <p className="text-sm" style={{ color: "rgb(248,113,113)" }}>
                      Failed to submit. Please try again.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ====================================================
              NAVIGATION BUTTONS
              ==================================================== */}
          <div className="flex justify-between mt-10">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  color: "#d1d5db",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(212,136,28,0.3)";
                  e.currentTarget.style.color = "#D4881C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.color = "#d1d5db";
                }}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 font-semibold rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: "#D4881C",
                  color: "#000",
                  boxShadow: "0 0 15px rgba(212,136,28,0.2)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E8A83E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#D4881C"; }}
              >
                {step === 4 ? "Skip / Continue" : "Continue"} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === "sending"}
                className="flex items-center gap-2 px-8 py-3 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
                style={{
                  backgroundColor: "#D4881C",
                  color: "#000",
                  boxShadow: "0 0 15px rgba(212,136,28,0.2)",
                }}
                onMouseEnter={(e) => {
                  if (status !== "sending") e.currentTarget.style.backgroundColor = "#E8A83E";
                }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#D4881C"; }}
              >
                {status === "sending" ? (
                  <>
                    <div
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: "#000", borderTopColor: "transparent" }}
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Quote Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
