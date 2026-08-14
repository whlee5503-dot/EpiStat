import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { translations } from '../i18n/translations';
import type { Lang } from '../i18n/translations';

interface Props {
    children: ReactNode;
    lang: Lang;
    /** Change this value (e.g. the active module key) to auto-reset the
     * boundary when the user navigates away from the module that errored. */
    resetKey?: string | number;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Logged for local debugging; EpiStat has no telemetry/reporting backend.
        console.error('EpiStat module error:', error, errorInfo);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false, error: null });
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            const T = translations[this.props.lang].errorBoundary;
            return (
                <div className="strat-empty-state" role="alert">
                    <div className="strat-empty-text">
                        <strong>{T.title}</strong>
                        <p style={{ marginTop: 'var(--space-2)' }}>{T.message}</p>
                        <button
                            type="button"
                            className="app-nav-btn"
                            style={{ marginTop: 'var(--space-3)' }}
                            onClick={this.handleRetry}
                        >
                            {T.retryButton}
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;