import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function SideMenu({ open, onClose, s }) {
  const navigate = useNavigate();

  function go(path) {
    onClose();
    navigate(path);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 90 }}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            style={{
              position: "fixed", top: 0, left: 0, bottom: 0, width: 260, zIndex: 91,
              background: "var(--surface)", borderRight: "1px solid var(--border-soft)",
              padding: "24px 20px", display: "flex", flexDirection: "column", gap: 6,
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 20, fontWeight: 700 }}>
              TRIOFIT
            </div>

            <button onClick={() => go("/about")} style={menuItemStyle}>
              <i className="ti ti-info-circle" style={{ fontSize: 18 }} />
              {s.menuAbout}
            </button>
            <button onClick={() => go("/register-store")} style={menuItemStyle}>
              <i className="ti ti-building-store" style={{ fontSize: 18 }} />
              {s.menuRegisterStore}
            </button>
            <button onClick={() => go("/yourfits")} style={menuItemStyle}>
              <i className="ti ti-photo" style={{ fontSize: 18 }} />
              YourFits
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const menuItemStyle = {
  display: "flex", alignItems: "center", gap: 12, padding: "12px 10px",
  background: "transparent", border: "none", color: "var(--text)",
  fontSize: 14, textAlign: "left", cursor: "pointer", borderRadius: 10,
};
