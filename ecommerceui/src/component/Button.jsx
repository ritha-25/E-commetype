export default function Button({ children, onClick, variant = 'primary', type = 'button', disabled }) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  )
}