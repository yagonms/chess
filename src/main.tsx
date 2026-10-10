import React,{useEffect,useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';
import{RotateCcw,Undo2,Users,Bot,Crown,Volume2,VolumeX}from'lucide-react';
import{initial,legalMoves,step,chooseMove,row,col,opponent,type Move,type State}from'./engine';
import './style.css';
function App(){
 const[state,setState]=useState<State>(initial);
 const[mode,setMode]=useState<'ai'|'local'>('ai');
 const[depth,setDepth]=useState(3);
 const[selected,setSelected]=useState<number|null>(null);
 const[choices,setChoices]=useState<Move[]>([]);
 const[history,setHistory]=useState<State[]>([]);
 const[sound,setSound]=useState(true);
 const[flipped,setFlipped]=useState(false);
 const moves=useMemo(()=>legalMoves(state.board,state.turn),[state]);
 const aiTurn=mode==='ai'&&state.turn==='dark'&&!state.winner&&!state.draw;
 function play(move:Move){
  setHistory(h=>[...h,state]);setState(s=>step(s,move));setSelected(null);setChoices([]);
  if(sound){try{const C=window.AudioContext;const ctx=new C();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=move.captures.length?320:510;gain.gain.value=.025;osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.09);osc.onended=()=>void ctx.close()}catch{}}
 }
 useEffect(()=>{if(!aiTurn)return;const id=window.setTimeout(()=>{const move=chooseMove(state,depth);if(move)play(move)},350);return()=>clearTimeout(id)},[state,aiTurn,depth]);
 function click(i:number){
  if(aiTurn||state.winner||state.draw)return;
  if(selected!==null){
   const matches=choices.filter(m=>m.to===i);
   if(matches.length===1){play(matches[0]);return}
   if(matches.length>1){play(matches[0]);return}
  }
  if(state.board[i]?.side===state.turn){setSelected(i);setChoices(moves.filter(m=>m.from===i))}
  else{setSelected(null);setChoices([])}
 }
 function reset(nextMode=mode){setMode(nextMode);setState(initial());setSelected(null);setChoices([]);setHistory([])}
 function undo(){if(!history.length)return;const count=mode==='ai'&&state.turn==='light'&&history.length>=2?2:1;setState(history[history.length-count]);setHistory(h=>h.slice(0,-count));setSelected(null);setChoices([])}
 const lightCount=state.board.filter(p=>p?.side==='light').length,darkCount=state.board.filter(p=>p?.side==='dark').length;
 const result=state.winner?(state.winner==='light'?'Peças claras venceram!':'Peças escuras venceram!'):state.draw?'Partida empatada':aiTurn?'Computador pensando...':state.turn==='light'?'Vez das peças claras':'Vez das peças escuras';
 return <main className="app"><header><div className="brand"><span className="brand-icon">♛</span><div><span className="eyebrow">EDIÇÃO CLÁSSICA</span><h1>Damas <em>Clássicas</em></h1></div></div><span className="version">VERSÃO 0.1</span></header><div className="layout"><section className="game"><div className="player-bar"><div className="player"><span className="avatar dark-piece">●</span><div><small>{mode==='ai'?'ADVERSÁRIO':'JOGADOR 2'}</small><strong>{mode==='ai'?'Computador':'Peças escuras'}</strong></div></div><div className="count">{darkCount} peças</div></div><div className="board-frame"><div className="board" role="grid" aria-label="Tabuleiro de damas">{Array.from({length:64},(_,n)=>{const i=flipped?63-n:n,r=row(i),c=col(i),p=state.board[i],dark=(r+c)%2===1,isTarget=choices.some(m=>m.to===i),isSource=selected===i;return <button key={i} type="button" role="gridcell" aria-label={`Linha ${r+1}, coluna ${c+1}${p?', '+(p.side==='light'?'peça clara':'peça escura')+(p.king?' dama':''):''}`} onClick={()=>click(i)} className={`square ${dark?'black':'white'} ${isSource?'selected':''} ${isTarget?'target':''}`} disabled={!dark}>{p&&<span className={`piece ${p.side}`}>{p.king?<Crown size={24} strokeWidth={2.5}/>:<span className="piece-center"/>}</span>}{isTarget&&<span className="hint"/>}</button>})}</div></div><div className="player-bar bottom"><div className="player"><span className="avatar light-piece">●</span><div><small>JOGADOR 1</small><strong>Peças claras</strong></div></div><div className="count">{lightCount} peças</div></div></section><aside className="panel"><div className="status"><span className="eyebrow">STATUS DA PARTIDA</span><h2>{result}</h2><p>{state.winner||state.draw?'Comece uma nova partida para jogar novamente.':moves.some(m=>m.captures.length)?'Captura obrigatória: escolha uma das jogadas destacadas.':'Selecione uma peça para ver os movimentos possíveis.'}</p></div><div className="section"><span className="eyebrow">MODO DE JOGO</span><div className="switch"><button className={mode==='ai'?'active':''} onClick={()=>reset('ai')}><Bot size={17}/> Contra IA</button><button className={mode==='local'?'active':''} onClick={()=>reset('local')}><Users size={17}/> Local</button></div></div>{mode==='ai'&&<div className="section"><label htmlFor="level" className="eyebrow">DIFICULDADE DA IA</label><select id="level" value={depth} onChange={e=>setDepth(Number(e.target.value))}><option value={1}>Iniciante</option><option value={3}>Intermediário</option><option value={5}>Avançado</option></select></div>}<div className="section"><span className="eyebrow">CONTROLES</span><div className="actions"><button onClick={()=>reset()}><RotateCcw size={18}/> Nova partida</button><button onClick={undo} disabled={!history.length||aiTurn}><Undo2 size={18}/> Desfazer</button><button onClick={()=>setFlipped(f=>!f)}>↕ Girar tabuleiro</button><button onClick={()=>setSound(s=>!s)}>{sound?<Volume2 size={18}/>:<VolumeX size={18}/>} Som {sound?'ligado':'desligado'}</button></div></div><div className="rules"><strong>Regras brasileiras</strong><p>Tabuleiro 8×8, captura obrigatória, regra da maioria e damas voadoras. Peças comuns capturam para trás.</p></div></aside></div><footer>DAMAS CLÁSSICAS · FEITO PARA JOGAR</footer></main>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
