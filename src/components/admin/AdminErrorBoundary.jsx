import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-8 bg-[#0a0f1d] border border-red-500/30 rounded-3xl text-slate-100 max-w-4xl mx-auto my-6 shadow-2xl font-tamil space-y-4">
          <div className="flex items-center gap-3 border-b border-red-500/20 pb-4">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl border border-red-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                பிரிவை ஏற்றுவதில் சிறிய தொழில்நுட்பப் பிழை ஏற்பட்டது
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-sans">
                {this.props.sectionName || 'Admin Component Render Exception'}
              </p>
            </div>
          </div>

          <div className="bg-[#050813] p-4 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto">
            {this.state.error?.toString() || 'Unknown Render Error'}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={this.handleReload}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>மீண்டும் ஏற்றுக (Reload Component)</span>
            </button>

            {this.props.onResetTab && (
              <button
                onClick={this.props.onResetTab}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition flex items-center gap-2 border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>முகப்புக்குத் திரும்பு (Back to Dashboard)</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
