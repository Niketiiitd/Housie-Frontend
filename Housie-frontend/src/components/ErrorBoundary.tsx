
export default function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Something went wrong!</h1>
      <p>{error.message}</p>
      <pre>{error.stack}</pre>
    </div>
  );
}
