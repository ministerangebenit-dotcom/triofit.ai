export function BoomerangSpinner({ size = 20 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "2px solid #ccc",
        borderTop: "2px solid #000",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}
