function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-message">
        <h3>❌ Error</h3>
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-btn">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
