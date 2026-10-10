export type Side = 'light' | 'dark';
export type Piece = {side:Side; king:boolean} | null;
export type Board = Piece[];
export type Move = {from:number;to:number;captures:number[];path:number[]};
export type State = {board:Board;turn:Side;winner:Side|null;draw:boolean;quiet:number;history:string[]};
export const opponent=(s:Side):Side=>s==='light'?'dark':'light';
export const row=(i:number)=>Math.floor(i/8);
export const col=(i:number)=>i%8;
const valid=(r:number,c:number)=>r>=0&&r<8&&c>=0&&c<8;
const index=(r:number,c:number)=>r*8+c;
export function initial():State{
 const board:Board=Array(64).fill(null);
 for(let r=0;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2===1){if(r<3)board[index(r,c)]={side:'dark',king:false};if(r>4)board[index(r,c)]={side:'light',king:false}}
 return {board,turn:'light',winner:null,draw:false,quiet:0,history:[]};
}
const dirs=[[-1,-1],[-1,1],[1,-1],[1,1]];
function capturePaths(board:Board,from:number):Move[]{
 const piece=board[from];if(!piece)return [];
 const results:Move[]=[];
 function visit(b:Board,at:number,taken:number[],path:number[]){
  let found=false;
  for(const [dr,dc] of dirs){
   const r=row(at),c=col(at);
   if(piece.king){
    let nr=r+dr,nc=c+dc,enemy=-1;
    while(valid(nr,nc)){
     const pos=index(nr,nc),target=b[pos];
     if(target){
      if(target.side===piece.side||enemy!==-1)break;
      enemy=pos;
     }else if(enemy!==-1){
      found=true;
      const next=b.slice();next[at]=null;next[enemy]=null;next[pos]=piece;
      visit(next,pos,[...taken,enemy],[...path,pos]);
     }
     nr+=dr;nc+=dc;
    }
   }else{
    const mr=r+dr,mc=c+dc,lr=r+2*dr,lc=c+2*dc;
    if(!valid(lr,lc))continue;
    const mid=index(mr,mc),land=index(lr,lc);
    if(b[mid]&&b[mid]!.side!==piece.side&&!b[land]){
     found=true;
     const next=b.slice();next[at]=null;next[mid]=null;next[land]=piece;
     visit(next,land,[...taken,mid],[...path,land]);
    }
   }
  }
  if(!found&&taken.length)results.push({from,to:at,captures:taken,path});
 }
 visit(board.slice(),from,[],[]);
 return results;
}
export function legalMoves(board:Board,side:Side):Move[]{
 const captures:Move[]=[];
 for(let i=0;i<64;i++)if(board[i]?.side===side)captures.push(...capturePaths(board,i));
 if(captures.length){const max=Math.max(...captures.map(m=>m.captures.length));return captures.filter(m=>m.captures.length===max)}
 const moves:Move[]=[];
 for(let i=0;i<64;i++){
  const piece=board[i];if(!piece||piece.side!==side)continue;
  for(const [dr,dc] of dirs){
   if(!piece.king&&dr!==(side==='light'?-1:1))continue;
   let r=row(i)+dr,c=col(i)+dc;
   while(valid(r,c)&&!board[index(r,c)]){
    const to=index(r,c);moves.push({from:i,to,captures:[],path:[to]});
    if(!piece.king)break;
    r+=dr;c+=dc;
   }
  }
 }
 return moves;
}
export function apply(board:Board,move:Move):Board{
 const next=board.slice();const piece=next[move.from];
 if(!piece)throw Error('Peça ausente');
 next[move.from]=null;
 for(const captured of move.captures)next[captured]=null;
 const crown=!piece.king&&(row(move.to)===(piece.side==='light'?0:7));
 next[move.to]={...piece,king:piece.king||crown};
 return next;
}
export function step(state:State,move:Move):State{
 const allowed=legalMoves(state.board,state.turn);
 if(!allowed.some(m=>m.from===move.from&&m.to===move.to&&m.path.join(',')===move.path.join(',')))throw Error('Jogada inválida');
 const board=apply(state.board,move),turn=opponent(state.turn);
 const quiet=move.captures.length||state.board[move.from]?.king===false?0:state.quiet+1;
 const key=board.map(p=>p?(p.side==='light'?'L':'D')+(p.king?'K':'M'):'.').join('')+turn;
 const history=[...state.history,key];
 const winner=legalMoves(board,turn).length===0?state.turn:null;
 const draw=quiet>=30||history.filter(h=>h===key).length>=3;
 return {board,turn,winner,draw:!winner&&draw,quiet,history};
}
const score=(b:Board,side:Side)=>b.reduce((sum,p,i)=>sum+(p?(p.side===side?1:-1)*(p.king?310:100)+(p.side===side?1:-1)*(p.king?0:3*(p.side==='light'?7-row(i):row(i))):0),0);
export function chooseMove(state:State,depth:number):Move|null{
 const moves=legalMoves(state.board,state.turn);if(!moves.length)return null;
 const perspective=state.turn;
 function search(board:Board,turn:Side,d:number,alpha:number,beta:number):number{
  const options=legalMoves(board,turn);
  if(!options.length)return turn===perspective?-100000-d:100000+d;
  if(d===0)return score(board,perspective);
  const maximizing=turn===perspective;
  let best=maximizing?-Infinity:Infinity;
  for(const move of options){
   const val=search(apply(board,move),opponent(turn),d-1,alpha,beta);
   best=maximizing?Math.max(best,val):Math.min(best,val);
   if(maximizing)alpha=Math.max(alpha,best);else beta=Math.min(beta,best);
   if(beta<=alpha)break;
  }
  return best;
 }
 let best=-Infinity,selected=moves[0];
 for(const m of moves){
  const val=search(apply(state.board,m),opponent(state.turn),Math.max(0,depth-1),-Infinity,Infinity)+Math.random()*.02;
  if(val>best){best=val;selected=m}
 }
 return selected;
}
