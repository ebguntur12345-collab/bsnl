import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Inbox as InboxIcon, 
  Send, 
  Star, 
  Trash2, 
  Search, 
  RotateCw, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Lock,
  LogOut,
  ArrowLeft,
  X,
  SendHorizontal,
  Paperclip,
  FileText,
  AlertCircle,
  FileEdit,
  AlertOctagon,
  Tag
} from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const GmailInboxContent = () => {
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('INBOX');
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('gmail_token'));
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef(null);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [attachment, setAttachment] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      localStorage.setItem('gmail_token', tokenResponse.access_token);
      setAccessToken(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.profile',
  });

  const logout = () => {
    localStorage.removeItem('gmail_token');
    setAccessToken(null);
    setMails([]);
    setUserProfile(null);
    setSelectedMail(null);
  };

  const decodeBase64 = (data) => {
    try {
      return decodeURIComponent(atob(data.replace(/-/g, '+').replace(/_/g, '/')).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch (e) {
      return "Unable to decode message content.";
    }
  };

  const getMessageBody = (payload) => {
    let body = "";
    if (payload.parts) {
      const textPart = payload.parts.find(part => part.mimeType === "text/html") || payload.parts.find(part => part.mimeType === "text/plain");
      if (textPart) {
        body = textPart.body.data ? decodeBase64(textPart.body.data) : "";
      } else {
        for (const part of payload.parts) {
          if (part.parts) {
            body = getMessageBody(part);
            if (body) break;
          }
        }
      }
    } else {
      body = payload.body.data ? decodeBase64(payload.body.data) : "";
    }
    return body;
  };

  const fetchGmailData = async (folder = currentFolder, query = searchQuery) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      if (!userProfile) {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const profileData = await profileRes.json();
        setUserProfile(profileData);
      }

      let apiQuery = '';
      if (query) {
        apiQuery = `&q=${encodeURIComponent(query)}`;
      } else {
        if (folder === 'SENT') apiQuery = '&q=in:sent';
        if (folder === 'TRASH') apiQuery = '&q=in:trash';
        if (folder === 'STARRED') apiQuery = '&q=is:starred';
        if (folder === 'SPAM') apiQuery = '&q=in:spam';
        if (folder === 'DRAFTS') apiQuery = '&q=in:draft';
        if (folder === 'IMPORTANT') apiQuery = '&q=is:important';
      }

      const listRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=15${apiQuery}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const listData = await listRes.json();

      if (listData.messages) {
        const detailPromises = listData.messages.map(async (msg) => {
          const detailRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          const detail = await detailRes.json();
          const getHeader = (name) => detail.payload.headers.find(h => h.name === name)?.value || '';
          
          return {
            id: detail.id,
            sender: getHeader(folder === 'SENT' ? 'To' : 'From'),
            subject: getHeader('Subject'),
            snippet: detail.snippet,
            date: getHeader('Date'),
            time: new Date(parseInt(detail.internalDate)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: detail.labelIds.includes('UNREAD'),
            raw: detail
          };
        });

        const fullMails = await Promise.all(detailPromises);
        setMails(fullMails);
      } else {
        setMails([]);
      }
    } catch (error) {
      if (error.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMail = async (id, e) => {
    if (e) e.stopPropagation();
    if (!accessToken) return;
    if (!window.confirm("Move this email to Trash?")) return;

    try {
      const res = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        if (selectedMail?.id === id) setSelectedMail(null);
        fetchGmailData();
      }
    } catch (error) {
      alert("Failed to delete email.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) return alert("File too large. Max 10MB.");
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachment({
          name: file.name,
          type: file.type,
          data: event.target.result.split(',')[1]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject) return alert("Please fill in Recipient and Subject.");
    
    setSendLoading(true);
    try {
      let emailContent = "";
      const boundary = "----------bsnl_mail_boundary_" + Date.now();

      if (attachment) {
        const parts = [
          `To: ${composeData.to}`,
          `Subject: ${composeData.subject}`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/mixed; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          'Content-Type: text/html; charset=utf-8',
          '',
          `<div>${composeData.body.replace(/\n/g, '<br/>')}</div>`,
          '',
          `--${boundary}`,
          `Content-Type: ${attachment.type}; name="${attachment.name}"`,
          'Content-Transfer-Encoding: base64',
          `Content-Disposition: attachment; filename="${attachment.name}"`,
          '',
          attachment.data,
          `--${boundary}--`
        ];
        emailContent = parts.join('\r\n');
      } else {
        const parts = [
          `To: ${composeData.to}`,
          `Subject: ${composeData.subject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=utf-8',
          '',
          `<div>${composeData.body.replace(/\n/g, '<br/>')}</div>`
        ];
        emailContent = parts.join('\r\n');
      }

      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (res.ok) {
        alert("🎉 Email Sent Successfully!");
        setIsComposing(false);
        setAttachment(null);
        setComposeData({ to: '', subject: '', body: '' });
        if (currentFolder === 'SENT') fetchGmailData();
      }
    } catch (error) {
      alert("Network Error.");
    } finally {
      setSendLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchGmailData();
    }
  }, [accessToken, currentFolder]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => setIsComposing(true)} className="flex items-center gap-2 bg-[#1e40af] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#1e3a8a] transition-all shrink-0">
            <Plus size={16} /> Compose
          </button>
          <div className="relative flex items-center gap-2 w-full max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search mail..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchGmailData(currentFolder, searchQuery)}
                className="pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              />
              {searchQuery && <X size={14} onClick={() => { setSearchQuery(''); fetchGmailData(currentFolder, ''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500" />}
            </div>
            <button 
              onClick={() => fetchGmailData(currentFolder, searchQuery)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm shrink-0"
            >
              Search
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {accessToken ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-700 uppercase leading-none">{userProfile?.name || 'Gmail Connected'}</p>
                <button onClick={logout} className="text-[9px] text-red-500 hover:underline font-bold">Sign Out</button>
              </div>
              {userProfile?.picture && <img src={userProfile.picture} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border-2 border-blue-100 shadow-sm" alt="profile" />}
            </div>
          ) : (
             <button onClick={() => login()} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Login</button>
          )}
          <RotateCw onClick={() => fetchGmailData()} size={18} className={`cursor-pointer hover:text-blue-500 transition-colors ${loading ? 'animate-spin text-blue-500' : 'text-gray-400'}`} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-50 p-4 space-y-1 bg-gray-50/20 shrink-0 overflow-y-auto">
          {[
            { icon: InboxIcon, label: "Inbox", id: 'INBOX' },
            { icon: Star, label: "Starred", id: 'STARRED' },
            { icon: Send, label: "Sent", id: 'SENT' },
            { icon: FileEdit, label: "Drafts", id: 'DRAFTS' },
            { icon: Tag, label: "Important", id: 'IMPORTANT' },
            { icon: AlertOctagon, label: "Spam", id: 'SPAM' },
            { icon: Trash2, label: "Trash", id: 'TRASH' },
          ].map((item) => (
            <button 
              key={item.label}
              onClick={() => { setCurrentFolder(item.id); setSelectedMail(null); setSearchQuery(''); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                currentFolder === item.id && !searchQuery ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-100 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-white">
          {!accessToken && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
              <button onClick={() => login()} className="bg-[#1e40af] text-white py-4 px-12 rounded-xl font-black uppercase tracking-widest shadow-xl">
                 Connect Gmail
              </button>
            </div>
          )}

          {selectedMail ? (
            <div className="flex-1 overflow-y-auto bg-white flex flex-col animate-in slide-in-from-right duration-300 z-10">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
                <button onClick={() => setSelectedMail(null)} className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <ArrowLeft size={18} /> Back to {currentFolder.toLowerCase()}
                </button>
                <div className="flex items-center gap-4">
                   <button onClick={() => handleDeleteMail(selectedMail.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Email">
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedMail.subject}</h2>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">{selectedMail.sender.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{selectedMail.sender}</p>
                    <p className="text-[10px] text-gray-400">{selectedMail.date}</p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 bg-white p-6 rounded-2xl border border-gray-100 min-h-[400px]" dangerouslySetInnerHTML={{ __html: selectedMail.body || 'No content' }} />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-gray-50">
              {loading && <div className="p-20 text-center text-blue-500 animate-pulse font-bold uppercase text-xs tracking-widest">Searching {currentFolder}...</div>}
              {mails.map((mail) => (
                <div 
                  key={mail.id}
                  onClick={() => setSelectedMail({ ...mail, body: getMessageBody(mail.raw.payload) })}
                  className={`group flex items-start gap-4 p-4 cursor-pointer hover:bg-blue-50/30 transition-colors ${mail.unread ? 'bg-white' : 'bg-gray-50/5'}`}
                >
                  <div className="mt-1"><Star size={18} className={`${mail.raw.labelIds.includes('STARRED') ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} hover:text-yellow-400`} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`text-sm truncate ${mail.unread ? 'font-black text-gray-900' : 'font-medium text-gray-600'}`}>{mail.sender.split(' <')[0]}</h4>
                      <div className="flex items-center gap-3">
                         <button 
                           onClick={(e) => handleDeleteMail(mail.id, e)}
                           className="hidden group-hover:flex p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                         >
                           <Trash2 size={14} />
                         </button>
                         <span className="text-[10px] text-gray-400 font-bold">{mail.time}</span>
                      </div>
                    </div>
                    <h5 className={`text-xs truncate mb-1 ${mail.unread ? 'font-bold text-gray-700' : 'text-gray-500'}`}>{mail.subject}</h5>
                    <p className="text-xs text-gray-400 truncate opacity-70">{mail.snippet}</p>
                  </div>
                </div>
              ))}
              {mails.length === 0 && !loading && (
                 <div className="p-20 text-center text-gray-300 flex flex-col items-center gap-4">
                   <Mail size={48} className="opacity-10" />
                   <p className="font-bold uppercase text-[10px] tracking-widest">No matching emails found</p>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* COMPOSE MODAL */}
      {isComposing && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-50 flex items-end justify-end p-6 pointer-events-none">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom duration-300">
            <div className="bg-[#1e40af] p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2"><Plus size={16} /> New Message</h3>
              <button onClick={() => setIsComposing(false)} className="hover:bg-white/20 p-1 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <input type="email" placeholder="To" value={composeData.to} onChange={(e) => setComposeData({...composeData, to: e.target.value})} className="w-full p-2 border-b border-gray-100 outline-none text-sm focus:border-blue-500" />
              <input type="text" placeholder="Subject" value={composeData.subject} onChange={(e) => setComposeData({...composeData, subject: e.target.value})} className="w-full p-2 border-b border-gray-100 outline-none text-sm font-bold" />
              <textarea placeholder="Write your message..." rows={12} value={composeData.body} onChange={(e) => setComposeData({...composeData, body: e.target.value})} className="w-full p-2 outline-none text-sm resize-none"></textarea>
              
              {attachment && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-blue-600" />
                    <p className="text-xs font-bold text-blue-900 truncate max-w-[200px]">{attachment.name}</p>
                  </div>
                  <button onClick={() => setAttachment(null)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept=".pdf,image/*" />
              <button onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2 text-xs font-bold">
                <Paperclip size={18} /> Attach File
              </button>
              <button onClick={handleSendEmail} disabled={sendLoading} className="bg-[#1e40af] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#1e3a8a] disabled:opacity-50 shadow-xl">
                {sendLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                {sendLoading ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Inbox = () => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <GmailInboxContent />
  </GoogleOAuthProvider>
);

export default Inbox;
