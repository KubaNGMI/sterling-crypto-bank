import { Component } from "react";
import EmptyState from "./EmptyState";
import { emptyIcons } from "./emptyIcons";

// Class component because React only recognizes getDerivedStateFromError /
// componentDidCatch on class components — there's no hook equivalent.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card">
          <EmptyState
            icon={emptyIcons.alert}
            title="Something went wrong"
            hint="This page hit an unexpected error. Reloading usually fixes it."
            action={{ label: "Reload page", onClick: () => window.location.reload() }}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
