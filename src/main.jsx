import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Heart, MessageCircle, Send, Bookmark, Home, Search, PlusSquare, Compass, Film, Menu, MoreHorizontal, Smile, Camera, Trash2, X, LogOut, Mail, Lock, User as UserIcon, Image as ImageIcon, Link as LinkIcon, PlaySquare, ChevronLeft, ChevronDown, Volume2, VolumeX, Music2 } from 'lucide-react';
import './styles.css';

const stories = [
  { user: 'tvoja_prica', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces', own: true },
  { user: 'ana.travel', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces' },
  { user: 'marko.fit', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces' },
  { user: 'design.lab', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces' },
  { user: 'foodie.rs', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces' },
  { user: 'urban.explore', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces' },
];

const initialPosts = [
  {
    id: 1,
    user: 'ana.travel',
    location: 'Santorini, Greece',
    avatar: stories[1].img,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1100&h=900&fit=crop',
    caption: 'Zalazak koji se pamti. More, vetar i savršena svetlost ✨',
    likes: 12864,
    comments: [
      { id: '1-a', user: 'marko.fit', text: 'Prelepo! 😍', likes: 4, liked: false, time: 'pre 7 min' },
      { id: '1-b', user: 'design.lab', text: 'Ovo ide na bucket listu.', likes: 2, liked: false, time: 'pre 4 min' }
    ],
    time: 'PRE 12 MINUTA'
  },
  {
    id: 2,
    user: 'design.lab',
    location: 'Belgrade Studio',
    avatar: stories[3].img,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1100&h=900&fit=crop',
    caption: 'Minimal setup za maksimalan fokus. Ko bi radio odavde?',
    likes: 5201,
    comments: [
      { id: '2-a', user: 'ana.travel', text: 'Clean 🔥', likes: 8, liked: false, time: 'pre 42 min' },
      { id: '2-b', user: 'urban.explore', text: 'Savršen workspace.', likes: 1, liked: false, time: 'pre 35 min' }
    ],
    time: 'PRE 1 SAT'
  },
  {
    id: 3,
    user: 'foodie.rs',
    location: 'Novi Sad',
    avatar: stories[4].img,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1100&h=900&fit=crop',
    caption: 'Danas: domaća pizza, sveže bilje i puno sira 🍕',
    likes: 9733,
    comments: [
      { id: '3-a', user: 'milica.art', text: 'Gladna sam sad.', likes: 3, liked: false, time: 'pre 2h' },
      { id: '3-b', user: 'nikola.photo', text: 'Recept?', likes: 6, liked: false, time: 'pre 1h' }
    ],
    time: 'PRE 3 SATA'
  }
];

function readStoredPost(post) {
  try {
    const saved = localStorage.getItem(`ig-post-${post.id}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

const AUTH_USERS_KEY = 'ig-auth-users';
const AUTH_SESSION_KEY = 'ig-auth-session';
const POSTS_KEY = 'ig-posts';

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY));
  } catch {
    return null;
  }
}

function loadPosts() {
  try {
    const saved = JSON.parse(localStorage.getItem(POSTS_KEY));
    return Array.isArray(saved) && saved.length ? saved : initialPosts;
  } catch {
    return initialPosts;
  }
}

function savePosts(posts) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function resetFields() {
    setUsername('');
    setEmail('');
    setPassword('');
    setError('');
  }

  function switchMode(next) {
    setMode(next);
    resetFields();
  }

  function handleLogin(e) {
    e.preventDefault();
    const users = loadUsers();
    const found = users.find(u => u.username === username.trim() && u.password === password);
    if (!found) {
      setError('Pogrešno korisničko ime ili lozinka.');
      return;
    }
    onAuth({ username: found.username, email: found.email });
  }

  function handleRegister(e) {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    if (!cleanUsername || !cleanEmail || !password) {
      setError('Popuni sva polja.');
      return;
    }
    if (password.length < 6) {
      setError('Lozinka mora imati bar 6 karaktera.');
      return;
    }
    const users = loadUsers();
    if (users.some(u => u.username === cleanUsername)) {
      setError('Korisničko ime već postoji.');
      return;
    }
    const newUser = { username: cleanUsername, email: cleanEmail, password };
    saveUsers([...users, newUser]);
    onAuth({ username: newUser.username, email: newUser.email });
  }

  return <div className="authPage">
    <div className="authCard">
      <div className="logo authLogo">Instagram</div>
      <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="authForm">
        {mode === 'register' && <label className="authField">
          <Mail size={18}/>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required/>
        </label>}
        <label className="authField">
          <UserIcon size={18}/>
          <input type="text" placeholder="Korisničko ime" value={username} onChange={e => setUsername(e.target.value)} required/>
        </label>
        <label className="authField">
          <Lock size={18}/>
          <input type="password" placeholder="Lozinka" value={password} onChange={e => setPassword(e.target.value)} required/>
        </label>
        {error && <p className="authError">{error}</p>}
        <button type="submit" className="authSubmit">{mode === 'login' ? 'Prijavi se' : 'Registruj se'}</button>
      </form>
    </div>
    <div className="authCard authSwitch">
      {mode === 'login'
        ? <p>Nemaš nalog? <a onClick={() => switchMode('register')}>Registruj se</a></p>
        : <p>Već imaš nalog? <a onClick={() => switchMode('login')}>Prijavi se</a></p>}
    </div>
  </div>;
}

function Sidebar({ currentUser, onLogout, onCreate, onProfile, onHome, onReels, onMessages }) {
  const items = [
    ['Početna', Home], ['Pretraga', Search], ['Istraži', Compass], ['Reels', Film], ['Poruke', Send], ['Obaveštenja', Heart]
  ];
  function handleNavClick(label) {
    if (label === 'Početna') return onHome;
    if (label === 'Reels') return onReels;
    if (label === 'Poruke') return onMessages;
    return undefined;
  }
  return <aside className="sidebar">
    <div className="logo" onClick={onHome} style={{cursor:'pointer'}}>Instagram</div>
    <nav>
      {items.map(([label, Icon]) => <button className="navItem" key={label} onClick={handleNavClick(label)}><Icon size={25}/><span>{label}</span></button>)}
      <button className="navItem" onClick={onCreate}><PlusSquare size={25}/><span>Kreiraj</span></button>
    </nav>
    <button className="profileBtn" onClick={onProfile}><img src={stories[0].img}/><span>{currentUser?.username || 'Profil'}</span></button>
    <button className="navItem menu"><Menu size={25}/><span>Više</span></button>
    <button className="navItem logoutBtn" onClick={onLogout}><LogOut size={25}/><span>Odjavi se</span></button>
  </aside>;
}

function Stories() {
  return <section className="stories">{stories.map(s => <div className="story" key={s.user}>
    <div className={s.own ? 'storyRing own' : 'storyRing'}><img src={s.img}/>{s.own && <span className="plus">+</span>}</div>
    <p>{s.user}</p>
  </div>)}</section>;
}

function Post({ post, onDelete, currentUser }) {
  const stored = useMemo(() => readStoredPost(post), [post.id]);
  const [liked, setLiked] = useState(stored?.liked ?? false);
  const [saved, setSaved] = useState(stored?.saved ?? false);
  const [comments, setComments] = useState(stored?.comments ?? post.comments);
  const [text, setText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef(null);

  const likeCount = post.likes + (liked ? 1 : 0);
  const visibleComments = showAllComments ? comments : comments.slice(-2);
  const canDelete = currentUser?.username === post.user;

  useEffect(() => {
    localStorage.setItem(`ig-post-${post.id}`, JSON.stringify({ liked, saved, comments }));
  }, [post.id, liked, saved, comments]);

  function triggerHeartBurst() {
    setHeartBurst(false);
    requestAnimationFrame(() => setHeartBurst(true));
    window.setTimeout(() => setHeartBurst(false), 750);
  }

  function toggleLike(forceLike = false) {
    setLiked(current => {
      const next = forceLike ? true : !current;
      if (next) triggerHeartBurst();
      return next;
    });
  }

  function addComment(e) {
    e.preventDefault();
    const clean = text.trim().replace(/\s+/g, ' ');
    if (!clean) return;

    const newComment = {
      id: `${post.id}-${Date.now()}`,
      user: currentUser?.username || 'tvoj_profil',
      text: clean,
      likes: 0,
      liked: false,
      time: 'sada',
      own: true
    };

    setComments(current => [...current, newComment]);
    setText('');
    setShowAllComments(true);
  }

  function toggleCommentLike(commentId) {
    setComments(current => current.map(comment => {
      if (comment.id !== commentId) return comment;
      const likedComment = !comment.liked;
      return { ...comment, liked: likedComment, likes: Math.max(0, comment.likes + (likedComment ? 1 : -1)) };
    }));
  }

  function deleteComment(commentId) {
    setComments(current => current.filter(comment => comment.id !== commentId));
  }

  return <article className="post">
    <header className="postHeader">
      <div className="postUser"><img src={post.avatar}/><div><strong>{post.user}</strong><small>{post.location}</small></div></div>
      {canDelete
        ? <button className="deletePostBtn" onClick={() => onDelete(post.id)} aria-label="Obriši objavu"><Trash2 size={20}/></button>
        : <div className="postMenuWrap">
            <button className="moreBtn" onClick={() => setShowMenu(s => !s)} aria-label="Više opcija"><MoreHorizontal size={24}/></button>
            {showMenu && <>
              <div className="menuOverlay" onClick={() => setShowMenu(false)}/>
              <div className="postMenu">
                <button className="menuItem danger" onClick={() => setShowMenu(false)}>Prijavi</button>
                <button className="menuItem danger" onClick={() => setShowMenu(false)}>Prestani pratiti</button>
                <button className="menuItem" onClick={() => setShowMenu(false)}>Dodaj u favorite</button>
                <button className="menuItem" onClick={() => setShowMenu(false)}>Više o ovom korisničkom računu</button>
                <button className="menuItem" onClick={() => setShowMenu(false)}>Više o ovoj objavi</button>
                <button className="menuItem" onClick={() => setShowMenu(false)}>Idi na objavu</button>
                <button className="menuItem" onClick={() => setShowMenu(false)}>Podijelite u...</button>
                <button className="menuItem" onClick={() => { navigator.clipboard?.writeText(`${window.location.href}#post-${post.id}`); setShowMenu(false); }}>Kopiraj poveznicu</button>
                <button className="menuItem" onClick={() => setShowMenu(false)}>Umetni</button>
              </div>
            </>}
          </div>}
    </header>

    <div className="imageWrap" onDoubleClick={() => toggleLike(true)}>
      <img className="postImage" src={post.image} alt={`${post.user} objava`} />
      {heartBurst && <Heart className="bigHeart" fill="currentColor" />}
    </div>

    <div className="actions">
      <div>
        <button onClick={() => toggleLike()} className={liked ? 'liked pop' : ''} aria-label={liked ? 'Ukloni lajk' : 'Lajkuj'}><Heart fill={liked ? 'currentColor' : 'none'}/></button>
        <button onClick={() => inputRef.current?.focus()} aria-label="Komentariši"><MessageCircle/></button>
        <button aria-label="Pošalji"><Send/></button>
      </div>
      <button onClick={() => setSaved(!saved)} className={saved ? 'saved pop' : ''} aria-label={saved ? 'Ukloni sačuvano' : 'Sačuvaj'}><Bookmark fill={saved ? 'currentColor' : 'none'}/></button>
    </div>

    <div className="postBody">
      <strong>{likeCount.toLocaleString('sr-RS')} sviđanja</strong>
      <p><b>{post.user}</b> {post.caption}</p>

      {comments.length > 2 && <button className="viewComments" onClick={() => setShowAllComments(!showAllComments)}>
        {showAllComments ? 'Sakrij komentare' : `Prikaži svih ${comments.length} komentara`}
      </button>}

      <div className="commentsList">
        {visibleComments.map(comment => <div className="commentRow" key={comment.id}>
          <div className="commentText">
            <p className="comment"><b>{comment.user}</b> {comment.text}</p>
            <span>{comment.time}{comment.likes > 0 ? ` · ${comment.likes} sviđanja` : ''}</span>
          </div>
          <button className={comment.liked ? 'miniHeart liked' : 'miniHeart'} onClick={() => toggleCommentLike(comment.id)} aria-label="Lajkuj komentar">
            <Heart size={14} fill={comment.liked ? 'currentColor' : 'none'} />
          </button>
          {comment.own && <button className="deleteComment" onClick={() => deleteComment(comment.id)} aria-label="Obriši komentar"><Trash2 size={14}/></button>}
        </div>)}
      </div>

      <small>{post.time}</small>
    </div>

    <form className="commentForm" onSubmit={addComment}>
      <Smile size={22}/>
      <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} maxLength={180} placeholder="Dodaj komentar..."/>
      {text && <button type="button" className="clearComment" onClick={() => setText('')} aria-label="Obriši tekst"><X size={16}/></button>}
      <button disabled={!text.trim()}>Objavi</button>
    </form>
  </article>;
}

function CreatePostModal({ currentUser, onClose, onCreate }) {
  const [step, setStep] = useState('select');
  const [uploadedImage, setUploadedImage] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function processFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Izaberi fajl slike.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result);
      setError('');
      setStep('edit');
    };
    reader.readAsDataURL(file);
  }

  function handleFile(e) {
    processFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  function handleSubmit(e) {
    e?.preventDefault();
    if (!uploadedImage) {
      setError('Dodaj sliku da bi objavio post.');
      return;
    }
    onCreate({
      image: uploadedImage,
      caption: caption.trim(),
      location: location.trim()
    });
  }

  return <div className="modalOverlay" onMouseDown={onClose}>
    <div className={`modalCard ${step === 'select' ? 'modalCardWide' : ''}`} onMouseDown={e => e.stopPropagation()}>
      <header className="modalHeader">
        {step === 'edit' && <button type="button" className="modalBack" onClick={() => setStep('select')} aria-label="Nazad"><ChevronLeft size={22}/></button>}
        <span>{step === 'select' ? 'Kreirajte novu objavu' : 'Kreiraj novu objavu'}</span>
        {step === 'edit'
          ? <button type="button" className="modalShareTop" onClick={handleSubmit}>Podeli</button>
          : <button className="modalClose" onClick={onClose} aria-label="Zatvori"><X size={20}/></button>}
      </header>

      {step === 'select'
        ? <div
            className={dragOver ? 'dropZoneBig dragOver' : 'dropZoneBig'}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="dropIconStack">
              <ImageIcon size={52} className="dropIconBack" />
              <PlaySquare size={38} className="dropIconFront" />
            </div>
            <p className="dropText">Ovamo povucite fotografije i videozapise</p>
            <label className="chooseFileBtn">
              Odaberi s računala
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} hidden />
            </label>
            {error && <p className="authError">{error}</p>}
            <footer className="modalFooterBar">
              <span className="langSelect">Hrvatski <ChevronDown size={13}/></span>
              <span>© 2026 Instagram from Meta</span>
            </footer>
          </div>
        : <form className="editForm" onSubmit={handleSubmit}>
            <div className="editPreview">
              <img src={uploadedImage} alt="Pregled" />
            </div>
            <div className="editFields">
              <div className="modalUserRow"><img className="modalUserAvatar" src={stories[0].img} alt="" /><b>{currentUser?.username}</b></div>
              <textarea className="modalTextarea" placeholder="Napiši natpis..." value={caption} onChange={e => setCaption(e.target.value)} maxLength={2200} rows={4} />
              <input className="modalInput" type="text" placeholder="Dodaj lokaciju" value={location} onChange={e => setLocation(e.target.value)} />
              {error && <p className="authError">{error}</p>}
            </div>
          </form>}
    </div>
  </div>;
}

function RightPanel() {
  const suggestions = [
    ['nikola.photo', 'Prati vas', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=faces'],
    ['milica.art', 'Novo na Instagramu', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop&crop=faces'],
    ['tech.balkan', 'Popularno', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=faces']
  ];
  return <aside className="rightPanel"><div className="me"><img src={stories[0].img}/><div><b>tvoj_profil</b><span>Vaše ime</span></div><a>Prebaci</a></div><div className="suggestTitle"><b>Predlozi za vas</b><a>Vidi sve</a></div>{suggestions.map(([u, sub, img]) => <div className="suggest" key={u}><img src={img}/><div><b>{u}</b><span>{sub}</span></div><button>Prati</button></div>)}<footer>Meta · About · Blog · Jobs · Help · API · Privacy · Terms<br/>© 2026 INSTAGRAM CLONE</footer></aside>;
}

function MobileTop({ onLogout, onHome, onMessages }) { return <div className="mobileTop"><div className="logo" onClick={onHome} style={{cursor:'pointer'}}>Instagram</div><div><Heart/><button className="mobileMsgBtn" onClick={onMessages} aria-label="Poruke"><Send/></button><button className="mobileLogout" onClick={onLogout} aria-label="Odjavi se"><LogOut size={22}/></button></div></div>; }
function MobileBottom({ onCreate, onProfile, onReels, onHome }) { return <div className="mobileBottom"><button className="mobileNavBtn" onClick={onHome} aria-label="Početna"><Home/></button><Search/><button className="mobileCreateBtn" onClick={onCreate} aria-label="Nova objava"><PlusSquare/></button><button className="mobileNavBtn" onClick={onReels} aria-label="Reels"><Film/></button><button className="mobileProfileBtn" onClick={onProfile} aria-label="Moj profil"><img src={stories[0].img}/></button></div>; }

function readStoredReel(reel) {
  try {
    const saved = localStorage.getItem(`ig-reel-${reel.id}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

const reelsData = [
  { id: 'r1', user: 'urban.explore', avatar: stories[5].img, video: 'https://assets.mixkit.co/videos/preview/mixkit-going-through-a-tunnel-in-a-car-42540-large.mp4', caption: 'Vožnja kroz grad noću 🌃', music: 'Originalni zvuk - urban.explore', likes: 18400, comments: 342 },
  { id: 'r2', user: 'ana.travel', avatar: stories[1].img, video: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4', caption: 'Zvuk talasa je najbolja terapija 🌊', music: 'Ocean Waves - Nature Sounds', likes: 25100, comments: 512 },
  { id: 'r3', user: 'design.lab', avatar: stories[3].img, video: 'https://assets.mixkit.co/videos/preview/mixkit-man-under-multicolored-lights-1237-large.mp4', caption: 'Igra svetla i senki ✨', music: 'Neon Dreams - Synthwave', likes: 9800, comments: 210 },
  { id: 'r4', user: 'foodie.rs', avatar: stories[4].img, video: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4', caption: 'Proleće stiže 🌼', music: 'Spring Vibes - Chill Beats', likes: 14200, comments: 187 },
];

function ReelItem({ reel }) {
  const stored = useMemo(() => readStoredReel(reel), [reel.id]);
  const [liked, setLiked] = useState(stored?.liked ?? false);
  const [saved, setSaved] = useState(stored?.saved ?? false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(`ig-reel-${reel.id}`, JSON.stringify({ liked, saved }));
  }, [reel.id, liked, saved]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      });
    }, { threshold: 0.6 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const likeCount = reel.likes + (liked ? 1 : 0);

  return <div className="reelItem">
    <div className="reelVideoWrap">
      <video
        ref={videoRef}
        className="reelVideo"
        src={reel.video}
        muted={muted}
        loop
        playsInline
        onClick={() => setMuted(m => !m)}
      />
      <button className="reelMuteBtn" onClick={() => setMuted(m => !m)} aria-label={muted ? 'Uključi zvuk' : 'Isključi zvuk'}>
        {muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
      </button>
      <div className="reelTopRow">
        <div className="reelUser"><img src={reel.avatar} alt={reel.user}/><b>{reel.user}</b><span className="reelFollow">Prati</span></div>
        <MoreHorizontal size={22} color="#fff"/>
      </div>
      <div className="reelBottomInfo">
        <p className="reelCaption"><b>{reel.user}</b> {reel.caption}</p>
        <div className="reelMusic"><Music2 size={14}/><span>{reel.music}</span></div>
      </div>
      <div className="reelActions">
        <button onClick={() => setLiked(l => !l)} className={liked ? 'liked' : ''} aria-label="Lajkuj"><Heart fill={liked ? 'currentColor' : 'none'}/><span>{likeCount.toLocaleString('sr-RS')}</span></button>
        <button aria-label="Komentariši"><MessageCircle/><span>{reel.comments}</span></button>
        <button aria-label="Pošalji"><Send/></button>
        <button onClick={() => setSaved(s => !s)} className={saved ? 'saved' : ''} aria-label="Sačuvaj"><Bookmark fill={saved ? 'currentColor' : 'none'}/></button>
        <button aria-label="Više"><MoreHorizontal/></button>
      </div>
    </div>
  </div>;
}

function ReelsPage() {
  return <div className="reelsPage">
    {reelsData.map(r => <ReelItem reel={r} key={r.id} />)}
  </div>;
}

function ProfilePage({ currentUser, posts, onBack }) {
  const myPosts = posts.filter(p => p.user === currentUser.username);
  return <div className="profilePage">
    <header className="profileTopBar">
      <button className="backBtn" onClick={onBack} aria-label="Nazad"><X size={22}/></button>
      <b>{currentUser.username}</b>
      <span/>
    </header>
    <section className="profileHeader">
      <img className="profileAvatar" src={stories[0].img} alt={currentUser.username}/>
      <div className="profileInfo">
        <div className="profileNameRow">
          <h2>{currentUser.username}</h2>
        </div>
        <div className="profileStats">
          <div><b>{myPosts.length}</b><span>objava</span></div>
          <div><b>0</b><span>pratilaca</span></div>
          <div><b>0</b><span>pratite</span></div>
        </div>
        <p className="profileBio">Dobrodošao/la na svoj profil ✨<br/>{currentUser.email}</p>
      </div>
    </section>
    <div className="profileDivider"/>
    {myPosts.length === 0
      ? <p className="noPosts">Još uvek nemaš objava. Klikni na "Kreiraj" da podeliš prvu fotografiju.</p>
      : <div className="profileGrid">
          {myPosts.map(p => <div className="profileGridItem" key={p.id}><img src={p.image} alt={p.caption}/></div>)}
        </div>}
  </div>;
}

const conversationsData = [
  { id: 'c1', user: 'ana.travel', avatar: stories[1].img, initial: [
      { id: 1, from: 'them', text: 'Ćao! Kako si? 😊', time: '10:12' },
      { id: 2, from: 'me', text: 'Super sam, upravo sam videla tvoju fotku sa Santorinija!', time: '10:14' },
      { id: 3, from: 'them', text: 'Hvala puno! Bilo je predivno tamo ☀️', time: '10:15' }
  ] },
  { id: 'c2', user: 'marko.fit', avatar: stories[2].img, initial: [
      { id: 1, from: 'them', text: 'Jesi li za trening sutra?', time: '09:02' },
      { id: 2, from: 'me', text: 'Da, vidimo se u 7!', time: '09:05' }
  ] },
  { id: 'c3', user: 'design.lab', avatar: stories[3].img, initial: [
      { id: 1, from: 'them', text: 'Pogledaj novi setup, šta kažeš?', time: 'Juče' }
  ] },
  { id: 'c4', user: 'foodie.rs', avatar: stories[4].img, initial: [
      { id: 1, from: 'them', text: 'Recept za pizzu ide uskoro na profil 🍕', time: 'Juče' }
  ] },
  { id: 'c5', user: 'urban.explore', avatar: stories[5].img, initial: [
      { id: 1, from: 'them', text: 'Vidimo se na snimanju sutra?', time: 'Pon' }
  ] }
];

const quickReplies = ['Haha, super! 😄', 'U pravu si!', 'Javljam ti se za 5 min.', 'Ok 👍', 'Zvuči dobro!', '😍😍😍'];

function loadDM(id, initial) {
  try {
    const saved = JSON.parse(localStorage.getItem(`ig-dm-${id}`));
    return Array.isArray(saved) && saved.length ? saved : initial;
  } catch {
    return initial;
  }
}

function MessagesPage({ currentUser, onBack }) {
  const [selected, setSelected] = useState(null);
  const [messagesMap, setMessagesMap] = useState(() => {
    const map = {};
    conversationsData.forEach(c => { map[c.id] = loadDM(c.id, c.initial); });
    return map;
  });
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    Object.entries(messagesMap).forEach(([id, msgs]) => {
      localStorage.setItem(`ig-dm-${id}`, JSON.stringify(msgs));
    });
  }, [messagesMap]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected, messagesMap[selected]?.length]);

  const activeConv = conversationsData.find(c => c.id === selected);
  const activeMessages = messagesMap[selected] || [];

  function lastMessagePreview(id) {
    const msgs = messagesMap[id] || [];
    const last = msgs[msgs.length - 1];
    if (!last) return '';
    return last.from === 'me' ? `Ti: ${last.text}` : last.text;
  }

  function sendMessage(e) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || !selected) return;
    const newMsg = { id: Date.now(), from: 'me', text: clean, time: 'sada' };
    setMessagesMap(current => ({ ...current, [selected]: [...(current[selected] || []), newMsg] }));
    setText('');
    const convId = selected;
    window.setTimeout(() => {
      const reply = quickReplies[Math.floor(Math.random() * quickReplies.length)];
      setMessagesMap(current => ({ ...current, [convId]: [...(current[convId] || []), { id: Date.now() + 1, from: 'them', text: reply, time: 'sada' }] }));
    }, 1000 + Math.random() * 900);
  }

  return <div className={`messagesPage ${selected ? 'chatOpen' : ''}`}>
    <aside className="dmList">
      <div className="dmListHeader"><b>{currentUser.username}</b><ChevronDown size={16}/></div>
      <div className="dmSearch"><Search size={16}/><input placeholder="Pretraga" readOnly/></div>
      <div className="dmTabsRow"><span className="active">Poruke</span><span>Zahtjevi</span></div>
      <div className="dmConversations">
        {conversationsData.map(c => <button key={c.id} className={selected === c.id ? 'dmConvItem active' : 'dmConvItem'} onClick={() => setSelected(c.id)}>
          <img src={c.avatar} alt={c.user}/>
          <div className="dmConvInfo"><b>{c.user}</b><span>{lastMessagePreview(c.id)}</span></div>
        </button>)}
      </div>
    </aside>
    <section className="dmChat">
      {activeConv
        ? <>
            <header className="dmChatHeader">
              <button className="dmBackBtn" onClick={() => setSelected(null)} aria-label="Nazad"><ChevronLeft size={22}/></button>
              <img src={activeConv.avatar} alt={activeConv.user}/>
              <b>{activeConv.user}</b>
              <div className="dmChatIcons"><Heart size={20}/><Send size={20}/></div>
            </header>
            <div className="dmMessages">
              {activeMessages.map(m => <div key={m.id} className={m.from === 'me' ? 'dmBubbleRow me' : 'dmBubbleRow them'}>
                <div className="dmBubble">{m.text}</div>
              </div>)}
              <div ref={bottomRef}/>
            </div>
            <form className="dmInputForm" onSubmit={sendMessage}>
              <Smile size={22}/>
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Poruka..."/>
              <button type="submit" disabled={!text.trim()}>Pošalji</button>
            </form>
          </>
        : <div className="dmEmptyState">
            <MessageCircle size={60}/>
            <p>Vaše poruke</p>
            <span>Pošaljite privatne fotografije i poruke prijatelju ili grupi.</span>
          </div>}
    </section>
  </div>;
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => loadSession());
  const [posts, setPosts] = useState(() => loadPosts());
  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState('feed');

  useEffect(() => {
    savePosts(posts);
  }, [posts]);

  function handleAuth(user) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    setCurrentUser(user);
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setCurrentUser(null);
    setView('feed');
  }

  function handleCreatePost({ image, caption, location }) {
    const newPost = {
      id: Date.now(),
      user: currentUser?.username || 'tvoj_profil',
      location: location || '',
      avatar: stories[0].img,
      image,
      caption,
      likes: 0,
      comments: [],
      time: 'UPRAVO SADA'
    };
    setPosts(current => [newPost, ...current]);
    setShowCreate(false);
  }

  function handleDeletePost(id) {
    setPosts(current => current.filter(p => p.id !== id));
    localStorage.removeItem(`ig-post-${id}`);
  }

  if (!currentUser) {
    return <AuthPage onAuth={handleAuth} />;
  }

  const showChrome = view !== 'profile' && view !== 'reels' && view !== 'messages';

  return <>
    <MobileTop onLogout={handleLogout} onHome={() => setView('feed')} onMessages={() => setView('messages')}/>
    <div className="app">
      <Sidebar currentUser={currentUser} onLogout={handleLogout} onCreate={() => setShowCreate(true)} onProfile={() => setView('profile')} onHome={() => setView('feed')} onReels={() => setView('reels')} onMessages={() => setView('messages')}/>
      {view === 'profile'
        ? <ProfilePage currentUser={currentUser} posts={posts} onBack={() => setView('feed')} />
        : view === 'reels'
        ? <ReelsPage />
        : view === 'messages'
        ? <MessagesPage currentUser={currentUser} onBack={() => setView('feed')} />
        : <main>
            <Stories/>
            {posts.map(p => <Post post={p} key={p.id} currentUser={currentUser} onDelete={handleDeletePost}/>)}
          </main>}
      {showChrome && <RightPanel/>}
    </div>
    {showChrome && <button className="floatCam" onClick={() => setShowCreate(true)}><Camera/><span>Novi post</span></button>}
    <MobileBottom onCreate={() => setShowCreate(true)} onProfile={() => setView(view === 'profile' ? 'feed' : 'profile')} onReels={() => setView(view === 'reels' ? 'feed' : 'reels')} onHome={() => setView('feed')}/>
    {showCreate && <CreatePostModal currentUser={currentUser} onClose={() => setShowCreate(false)} onCreate={handleCreatePost} />}
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
