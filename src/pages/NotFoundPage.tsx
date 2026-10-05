import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import StatePanel from "../components/ui/StatePanel";

export default function NotFoundPage() {
  return (
    <PageTransition>
      <div className="kb-container py-20">
        <StatePanel
          variant="search"
          title="This page wandered off"
          message="We couldn't find the page you were looking for. Let's get you back to the stories."
          action={
            <>
              <Link to="/" className="kb-btn kb-btn-primary">
                Back to home
              </Link>
              <Link to="/books" className="kb-btn kb-btn-secondary">
                Browse books
              </Link>
            </>
          }
        />
      </div>
    </PageTransition>
  );
}
