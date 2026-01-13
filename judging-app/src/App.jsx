import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Trash2, Download, Award, ExternalLink, FileText, Layout, Save, Loader2, Users, Calculator, Lock, Unlock, MousePointerClick } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyB0YpmA44IxJAIWkuJjA25VizAFCHPjI2Q",
  authDomain: "sisfofest-judging.firebaseapp.com",
  projectId: "sisfofest-judging",
  storageBucket: "sisfofest-judging.firebasestorage.app",
  messagingSenderId: "547826864274",
  appId: "1:547826864274:web:c8abcc20430bc0961bd64b",
  measurementId: "G-QVWRVGNDEP"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function JudgingApp() {
  const [teams, setTeams] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSorted, setIsSorted] = useState(false);
  const [activeTab, setActiveTab] = useState('welcome'); 
  const [isAdmin, setIsAdmin] = useState(false); 

  const weights = {
    c1: 0.30, // Problem Solving
    c2: 0.30, // UX
    c3: 0.25, // UI
    c4: 0.15  // Teknis
  };

  // --- UPDATE DAFTAR PIN JURI (ADA JURI 4) ---
  const judgePINs = {
    j1: "pin_juri1", // PIN Pak Budi
    j2: "pin_juri2", // PIN Ibu Izmi
    j3: "pin_juri3", // PIN Pak Faizal
    j4: "pin_juri4"  // PIN Juri 4
  };

  // --- FUNGSI GANTI TAB DENGAN PIN ---
  const handleTabChange = (selectedTab) => {
    if (isAdmin) {
      setActiveTab(selectedTab);
      return;
    }
    if (activeTab === selectedTab) return;

    let correctPIN = "";
    let judgeName = "";

    if (selectedTab === 'j1') { correctPIN = judgePINs.j1; judgeName = "Pak Budi"; }
    else if (selectedTab === 'j2') { correctPIN = judgePINs.j2; judgeName = "Ibu Izmi"; }
    else if (selectedTab === 'j3') { correctPIN = judgePINs.j3; judgeName = "Pak Faizal"; }
    else if (selectedTab === 'j4') { correctPIN = judgePINs.j4; judgeName = "Juri Baru"; }

    if (selectedTab === 'rekap') return;

    const inputPIN = prompt(`🔒 Masukkan PIN Akses untuk ${judgeName}:`);
    
    if (inputPIN === correctPIN) {
      setActiveTab(selectedTab);
    } else {
      alert("❌ PIN Salah! Akses ditolak.");
    }
  };

  const handleAdminAccess = () => {
    if (isAdmin) {
      setIsAdmin(false); 
      setIsSorted(false);
      setActiveTab('welcome'); 
    } else {
      const password = prompt("🔒 Masukkan Password Admin:");
      if (password === "admin123") {
        setIsAdmin(true);
        setActiveTab('rekap'); 
      } else if (password !== null) {
        alert("❌ Password Salah! Akses ditolak.");
      }
    }
  };

  const calculateJudgeTotal = (team, prefix) => {
    const c1 = team[`${prefix}_c1`] || 0;
    const c2 = team[`${prefix}_c2`] || 0;
    const c3 = team[`${prefix}_c3`] || 0;
    const c4 = team[`${prefix}_c4`] || 0;
    
    const total = (c1 * weights.c1) + (c2 * weights.c2) + (c3 * weights.c3) + (c4 * weights.c4);
    return parseFloat(total.toFixed(2));
  };

  // --- UPDATE RUMUS RATA-RATA (BAGI 4) ---
  const calculateFinalAverage = (team) => {
    const t1 = calculateJudgeTotal(team, 'j1');
    const t2 = calculateJudgeTotal(team, 'j2');
    const t3 = calculateJudgeTotal(team, 'j3');
    const t4 = calculateJudgeTotal(team, 'j4'); // Tambah Juri 4
    
    const final = (t1 + t2 + t3 + t4) / 4; // Dibagi 4
    return parseFloat(final.toFixed(2));
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'penjurian_data'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsData);
      setLoading(false);
    }, (error) => {
      console.error("Data Fetch Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleScoreChange = async (id, field, value) => {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) numValue = 0;
    if (numValue > 100) numValue = 100;
    if (numValue < 0) numValue = 0;

    const actualField = `${activeTab}_${field}`;
    const teamRef = doc(db, 'penjurian_data', id);
    await updateDoc(teamRef, { [actualField]: numValue });
  };

  const handleTextChange = async (id, field, value) => {
    const teamRef = doc(db, 'penjurian_data', id);
    await updateDoc(teamRef, { [field]: value });
  };

  const handleCommentChange = async (id, value) => {
    const field = `${activeTab}_comment`;
    const teamRef = doc(db, 'penjurian_data', id);
    await updateDoc(teamRef, { [field]: value });
  };

  // --- UPDATE DATA AWAL TIM BARU (ADA J4) ---
  const addTeam = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'penjurian_data'), {
        name: "Tim Baru",
        title: "-",
        proposalUrl: "",
        figmaUrl: "",
        j1_c1: 0, j1_c2: 0, j1_c3: 0, j1_c4: 0, j1_comment: "",
        j2_c1: 0, j2_c2: 0, j2_c3: 0, j2_c4: 0, j2_comment: "",
        j3_c1: 0, j3_c2: 0, j3_c3: 0, j3_c4: 0, j3_comment: "",
        j4_c1: 0, j4_c2: 0, j4_c3: 0, j4_c4: 0, j4_comment: "", // Tambah Juri 4
        createdAt: Date.now()
      });
    } catch (e) {
      console.error("Error adding team: ", e);
      alert("Gagal menambah tim. Cek koneksi internet.");
    }
  };

  const removeTeam = async (id) => {
    if(window.confirm("Yakin ingin menghapus tim ini permanen?")) {
      await deleteDoc(doc(db, 'penjurian_data', id));
    }
  };

  const toggleSort = () => setIsSorted(!isSorted);

  // --- UPDATE EXPORT CSV (ADA JURI 4) ---
  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rank,Nama Tim,Judul Proyek,Nilai Juri 1,Nilai Juri 2,Nilai Juri 3,Nilai Juri 4,RATA-RATA AKHIR\n";
    const sortedForExport = [...teams].sort((a, b) => calculateFinalAverage(b) - calculateFinalAverage(a));
    sortedForExport.forEach((team, index) => {
      const row = [
        index + 1, `"${team.name || ''}"`, `"${team.title || ''}"`,
        calculateJudgeTotal(team, 'j1'), calculateJudgeTotal(team, 'j2'), calculateJudgeTotal(team, 'j3'), calculateJudgeTotal(team, 'j4'), calculateFinalAverage(team)
      ].join(",");
      csvContent += row + "\r\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Rekap_Nilai_4Juri_SISFOFEST2025.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayTeams = isSorted 
    ? [...teams].sort((a, b) => calculateFinalAverage(b) - calculateFinalAverage(a))
    : [...teams].sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <div className={`shadow-lg sticky top-0 z-10 transition-colors ${isAdmin ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-2 sm:mb-0">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-300" />
              SISFO FEST JURI SYSTEM
            </h1>
            <p className="text-xs opacity-80 flex items-center gap-2">
              {isAdmin ? "🔧 MODE ADMIN: ON" : "👋 SELAMAT DATANG"}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleAdminAccess} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAdmin ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-800 hover:bg-indigo-900 text-indigo-100'}`}>
               {isAdmin ? <Unlock size={14}/> : <Lock size={14}/>} {isAdmin ? "Admin Akses" : "Juri View"}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-[98%] mx-auto mt-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <button onClick={addTeam} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 font-medium text-sm transition-colors">
                    <Plus size={16} /> Tambah Tim
                  </button>
                  <button onClick={toggleSort} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-medium text-sm transition-colors ${isSorted ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    <Trophy size={16} /> {isSorted ? 'Ranking: ON' : 'Ranking: OFF'}
                  </button>
                </>
              )}
            </div>
            {isAdmin && (
              <button onClick={downloadCSV} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 font-medium text-sm transition-colors">
                <Download size={16} /> Export CSV
              </button>
            )}
          </div>
          
          {/* TAB JURI - TAMBAHKAN J4 DI SINI */}
          <div className="flex overflow-x-auto gap-1 bg-slate-200 p-1 rounded-xl">
             {['j1', 'j2', 'j3', 'j4', 'rekap']
               .filter(tab => tab === 'rekap' ? isAdmin : true)
               .map((tab) => {
                const isActive = activeTab === tab;
                let label = "";
                if (tab === 'j1') label = "👤 Pak Budi";     
                else if (tab === 'j2') label = "👤 Ibu Izmi";  
                else if (tab === 'j3') label = "👤 Pak Faizal"; 
                else if (tab === 'j4') label = "👤 Kak Miftahul Fauzi"; // GANTI NAMA JURI 4 DISINI
                else label = "📊 REKAP FINAL";

                let icon = tab === 'rekap' ? <Calculator size={14}/> : <Users size={14}/>;
                return (
                  <button key={tab} onClick={() => handleTabChange(tab)} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-white text-indigo-700 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'}`}>
                    {icon} {label}
                  </button>
                )
             })}
          </div>
        </div>

        {activeTab === 'welcome' ? (
           <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-xl border border-slate-200 text-center px-4">
              <div className="bg-indigo-100 p-4 rounded-full mb-4">
                 <MousePointerClick className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang di Sistem Penjurian</h2>
              <p className="text-slate-500 max-w-md mb-8">
                 Silakan <strong>pilih Nama Anda</strong> pada tombol (Tab) di bagian atas untuk mulai melakukan penilaian.
              </p>
              <div className="text-sm text-slate-400 border-t pt-4 w-full max-w-xs">
                 <p>Sistem ini menyimpan nilai secara otomatis.</p>
              </div>
           </div>
        ) : (
           <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 mb-20">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-indigo-100 uppercase bg-slate-800">
                   <tr>
                     <th className="px-3 py-3 w-10 text-center">#</th>
                     <th className="px-3 py-3 min-w-[200px]">Identitas Tim</th>
                     {/* TABEL REKAP DENGAN 4 JURI */}
                     {activeTab === 'rekap' ? (
                         <>
                            <th className="px-2 py-3 text-center w-16 bg-indigo-900/40">J1</th>
                            <th className="px-2 py-3 text-center w-16 bg-indigo-900/40">J2</th>
                            <th className="px-2 py-3 text-center w-16 bg-indigo-900/40">J3</th>
                            <th className="px-2 py-3 text-center w-16 bg-indigo-900/40">J4</th>
                            <th className="px-3 py-3 text-center w-24 bg-yellow-600 text-white font-bold">AVG</th>
                         </>
                      ) : (
                         <>
                            <th className="px-1 py-3 text-center w-16 bg-indigo-900/50">Prob<div className="text-[9px]">30%</div></th>
                            <th className="px-1 py-3 text-center w-16 bg-indigo-800/50">UX<div className="text-[9px]">30%</div></th>
                            <th className="px-1 py-3 text-center w-16 bg-indigo-900/50">UI<div className="text-[9px]">25%</div></th>
                            <th className="px-1 py-3 text-center w-16 bg-indigo-800/50">Tek<div className="text-[9px]">15%</div></th>
                            <th className="px-2 py-3 text-center w-20 bg-slate-700 text-white font-bold">TOTAL</th>
                         </>
                      )}
                     <th className="px-3 py-3 min-w-[150px]">{activeTab === 'rekap' ? 'Info' : 'Catatan'}</th>
                     {isAdmin && <th className="px-2 py-3 text-center w-10">Act</th>}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {displayTeams.map((team, index) => {
                     let rowClass = "hover:bg-indigo-50/30 transition-colors";
                     if (isSorted && index === 0) rowClass = "bg-yellow-50";
                     const finalAvg = calculateFinalAverage(team);
                     const currentJudgeTotal = calculateJudgeTotal(team, activeTab);

                     return (
                       <tr key={team.id} className={rowClass}>
                         <td className="px-3 py-4 text-center font-bold text-slate-400 text-xs">{index + 1}</td>
                         <td className="px-3 py-3">
                           <div className="space-y-1">
                             {isAdmin ? (
                               <>
                                 <input type="text" value={team.name} onChange={(e) => handleTextChange(team.id, 'name', e.target.value)} className="w-full font-bold bg-transparent border-b focus:border-indigo-500 outline-none" placeholder="Nama Tim" />
                                 <input type="text" value={team.title} onChange={(e) => handleTextChange(team.id, 'title', e.target.value)} className="w-full text-xs text-slate-500 bg-transparent border-b focus:border-indigo-500 outline-none" placeholder="Judul..." />
                               </>
                             ) : (
                               <>
                                 <div className="font-bold text-slate-800">{team.name}</div>
                                 <div className="text-xs text-slate-500">{team.title}</div>
                               </>
                             )}
                             <div className="flex gap-2 mt-1">
                                {team.proposalUrl && <a href={team.proposalUrl} target="_blank" className="text-[10px] bg-red-100 text-red-600 px-1 rounded flex items-center gap-1"><FileText size={10}/> PDF</a>}
                                {team.figmaUrl && <a href={team.figmaUrl} target="_blank" className="text-[10px] bg-purple-100 text-purple-600 px-1 rounded flex items-center gap-1"><Layout size={10}/> Figma</a>}
                                {isAdmin && <input type="text" value={team.proposalUrl} onChange={(e)=>handleTextChange(team.id, 'proposalUrl', e.target.value)} placeholder="Link PDF" className="w-20 text-[9px] border rounded px-1"/>}
                             </div>
                           </div>
                         </td>
                         
                         {activeTab === 'rekap' ? (
                           <>
                              <td className="px-2 text-center text-xs text-slate-500">{calculateJudgeTotal(team, 'j1')}</td>
                              <td className="px-2 text-center text-xs text-slate-500">{calculateJudgeTotal(team, 'j2')}</td>
                              <td className="px-2 text-center text-xs text-slate-500">{calculateJudgeTotal(team, 'j3')}</td>
                              <td className="px-2 text-center text-xs text-slate-500">{calculateJudgeTotal(team, 'j4')}</td>
                              <td className="px-3 text-center font-bold bg-yellow-50/50 text-slate-800">{finalAvg}</td>
                           </>
                         ) : (
                           <>
                              {['c1', 'c2', 'c3', 'c4'].map((crit) => (
                                <td key={crit} className="p-1 text-center bg-indigo-50/10">
                                  <input type="number" value={team[`${activeTab}_${crit}`]} onChange={(e) => handleScoreChange(team.id, crit, e.target.value)} className="w-12 text-center text-sm font-semibold text-indigo-700 bg-white border rounded focus:ring-2 outline-none" />
                                </td>
                              ))}
                              <td className="px-2 text-center font-bold text-slate-700">{currentJudgeTotal}</td>
                           </>
                         )}

                         <td className="px-3 py-3">
                             {activeTab !== 'rekap' && <textarea rows="1" value={team[`${activeTab}_comment`]} onChange={(e) => handleCommentChange(team.id, e.target.value)} className="w-full text-xs border rounded p-1" placeholder="Catatan..." />}
                         </td>
                         {isAdmin && (
                           <td className="px-2 text-center">
                             <button onClick={() => removeTeam(team.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                           </td>
                         )}
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}