import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RootErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('amaze_saved_bookmarks');
      sessionStorage.clear();
    } catch (_) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-tamil">
          <div className="max-w-lg w-full bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                பக்கத்தை ஏற்றுவதில் சிறு தடங்கல் ஏற்பட்டுள்ளது
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                செய்தித் தரவை உடனடியாக மீட்டெடுக்க கீழே உள்ள பொத்தானை அழுத்தவும்.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-red-300 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition cursor-pointer shadow-lg shadow-red-900/40"
              >
                <RefreshCw className="w-4 h-4" />
                <span>மீண்டும் ஏற்றுக (Reload)</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>முகப்புக்குச் செல்க</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RootErrorBoundary;
