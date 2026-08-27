/**
 * Full-height centered loading spinner for page-level loading states.
 * Fills all available flex space (works both as Suspense fallback in the
 * router and as an inline isPending guard inside a page component).
 */
export function PageSpinner() {
    return (
        <div className="page-spinner">
            <span className="spinner" style={{ width: 40, height: 40 }} />
        </div>
    )
}
