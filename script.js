
const sleep = ms => new Promise(res => setTimeout(res, ms));

document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const mode = tab.dataset.mode;
    document.getElementById('sortingPanel').classList.toggle('active', mode === 'sorting');
    document.getElementById('pathPanel').classList.toggle('active', mode === 'pathfinding');
  });
});

const barsContainer = document.getElementById('barsContainer');
const sizeRange      = document.getElementById('sizeRange');
const sizeVal        = document.getElementById('sizeVal');
const speedRange     = document.getElementById('speedRange');
const algoSelect     = document.getElementById('algoSelect');
const newArrayBtn    = document.getElementById('newArrayBtn');
const sortBtn        = document.getElementById('sortBtn');
const sortInfo       = document.getElementById('sortInfo');

let arr = [];
let bars = [];
let isSorting = false;

const SORT_COMPLEXITY = {
  bubble:    'Time: O(n&sup2;) &nbsp;|&nbsp; Space: O(1) &nbsp;|&nbsp; Stable',
  selection: 'Time: O(n&sup2;) &nbsp;|&nbsp; Space: O(1) &nbsp;|&nbsp; Not stable',
  insertion: 'Time: O(n&sup2;), O(n) best case &nbsp;|&nbsp; Space: O(1) &nbsp;|&nbsp; Stable',
  merge:     'Time: O(n log n) &nbsp;|&nbsp; Space: O(n) &nbsp;|&nbsp; Stable',
  quick:     'Time: O(n log n) avg, O(n&sup2;) worst &nbsp;|&nbsp; Space: O(log n)'
};

function updateSortInfo(){
  sortInfo.innerHTML = SORT_COMPLEXITY[algoSelect.value];
}

function generateArray(){
  const size = +sizeRange.value;
  arr = Array.from({length: size}, () => Math.floor(Math.random() * 290) + 10);
  renderBars();
}

function renderBars(){
  barsContainer.innerHTML = '';
  const max = Math.max(...arr);
  bars = arr.map(value => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${(value / max) * 100}%`;
    barsContainer.appendChild(bar);
    return bar;
  });
}

function setControlsDisabled(disabled){
  [sizeRange, speedRange, algoSelect, newArrayBtn, sortBtn].forEach(el => el.disabled = disabled);
}

function getDelay(){
  return Math.round(220 - (+speedRange.value) * 2);
}
async function bubbleSort(){
  const n = arr.length;
  for(let i = 0; i < n - 1; i++){
    for(let j = 0; j < n - 1 - i; j++){
      bars[j].classList.add('comparing');
      bars[j+1].classList.add('comparing');
      await sleep(getDelay());
      if(arr[j] > arr[j+1]){
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        bars[j].classList.add('swapping');
        bars[j+1].classList.add('swapping');
        swapHeights(j, j+1);
        await sleep(getDelay());
        bars[j].classList.remove('swapping');
        bars[j+1].classList.remove('swapping');
      }
      bars[j].classList.remove('comparing');
      bars[j+1].classList.remove('comparing');
    }
    bars[n - 1 - i].classList.add('sorted');
  }
  bars[0].classList.add('sorted');
}

async function selectionSort(){
  const n = arr.length;
  for(let i = 0; i < n; i++){
    let minIdx = i;
    bars[minIdx].classList.add('comparing');
    for(let j = i + 1; j < n; j++){
      bars[j].classList.add('comparing');
      await sleep(getDelay());
      if(arr[j] < arr[minIdx]){
        bars[minIdx].classList.remove('comparing');
        minIdx = j;
      } else {
        bars[j].classList.remove('comparing');
      }
    }
    if(minIdx !== i){
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swapHeights(i, minIdx);
    }
    bars[minIdx].classList.remove('comparing');
    bars[i].classList.add('sorted');
  }
}

async function insertionSort(){
  const n = arr.length;
  for(let i = 1; i < n; i++){
    let j = i;
    bars[j].classList.add('swapping');
    await sleep(getDelay());
    while(j > 0 && arr[j-1] > arr[j]){
      [arr[j-1], arr[j]] = [arr[j], arr[j-1]];
      swapHeights(j-1, j);
      bars[j-1].classList.add('comparing');
      await sleep(getDelay());
      bars[j-1].classList.remove('comparing');
      j--;
    }
    bars[j].classList.remove('swapping');
  }
  bars.forEach(b => b.classList.add('sorted'));
}

async function mergeSortRange(l, r){
  if(l >= r) return;
  const mid = Math.floor((l + r) / 2);
  await mergeSortRange(l, mid);
  await mergeSortRange(mid + 1, r);
  await merge(l, mid, r);
}

async function merge(l, mid, r){
  const left = arr.slice(l, mid + 1);
  const right = arr.slice(mid + 1, r + 1);
  let i = 0, j = 0, k = l;
  while(i < left.length && j < right.length){
    bars[k].classList.add('comparing');
    await sleep(getDelay());
    if(left[i] <= right[j]){ arr[k] = left[i]; i++; }
    else { arr[k] = right[j]; j++; }
    updateHeight(k);
    bars[k].classList.remove('comparing');
    bars[k].classList.add('swapping');
    k++;
  }
  while(i < left.length){ arr[k] = left[i]; updateHeight(k); bars[k].classList.add('swapping'); i++; k++; }
  while(j < right.length){ arr[k] = right[j]; updateHeight(k); bars[k].classList.add('swapping'); j++; k++; }
  await sleep(getDelay());
  for(let x = l; x <= r; x++) bars[x].classList.remove('swapping');
}

async function quickSortRange(l, r){
  if(l >= r) return;
  const p = await partition(l, r);
  await quickSortRange(l, p - 1);
  await quickSortRange(p + 1, r);
}

async function partition(l, r){
  const pivot = arr[r];
  bars[r].classList.add('comparing'); // pivot marker
  let i = l - 1;
  for(let j = l; j < r; j++){
    bars[j].classList.add('comparing');
    await sleep(getDelay());
    if(arr[j] < pivot){
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      swapHeights(i, j);
    }
    bars[j].classList.remove('comparing');
  }
  [arr[i+1], arr[r]] = [arr[r], arr[i+1]];
  swapHeights(i+1, r);
  bars[r].classList.remove('comparing');
  bars[i+1].classList.add('sorted');
  return i + 1;
}

function swapHeights(i, j){
  updateHeight(i);
  updateHeight(j);
}
function updateHeight(i){
  const max = Math.max(...arr);
  bars[i].style.height = `${(arr[i] / max) * 100}%`;
}

async function runSort(){
  if(isSorting) return;
  isSorting = true;
  setControlsDisabled(true);
  bars.forEach(b => b.classList.remove('sorted','comparing','swapping'));

  const algo = algoSelect.value;
  if(algo === 'bubble') await bubbleSort();
  else if(algo === 'selection') await selectionSort();
  else if(algo === 'insertion') await insertionSort();
  else if(algo === 'merge'){ await mergeSortRange(0, arr.length - 1); bars.forEach(b => { b.classList.remove('swapping'); b.classList.add('sorted'); }); }
  else if(algo === 'quick'){ await quickSortRange(0, arr.length - 1); bars.forEach(b => b.classList.add('sorted')); }

  isSorting = false;
  setControlsDisabled(false);
}

sizeRange.addEventListener('input', () => { sizeVal.textContent = sizeRange.value; });
sizeRange.addEventListener('change', generateArray);
newArrayBtn.addEventListener('click', generateArray);
sortBtn.addEventListener('click', runSort);
algoSelect.addEventListener('change', updateSortInfo);

updateSortInfo();
generateArray();

const ROWS = 16, COLS = 38;
const gridEl = document.getElementById('grid');
gridEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

const pathAlgoSelect   = document.getElementById('pathAlgoSelect');
const pathSpeedRange   = document.getElementById('pathSpeedRange');
const clearWallsBtn    = document.getElementById('clearWallsBtn');
const clearPathBtn     = document.getElementById('clearPathBtn');
const visualizePathBtn = document.getElementById('visualizePathBtn');
const pathInfo         = document.getElementById('pathInfo');
const pathMessage      = document.getElementById('pathMessage');
const toolBtns         = document.querySelectorAll('.tool-btn');

const PATH_COMPLEXITY = {
  bfs:      'Time: O(V + E) &nbsp;|&nbsp; Guarantees shortest path (unweighted)',
  dfs:      'Time: O(V + E) &nbsp;|&nbsp; Does NOT guarantee shortest path',
  dijkstra: 'Time: O(V&sup2;) this implementation &nbsp;|&nbsp; Guarantees shortest path',
  astar:    'Time: O(E) with good heuristic &nbsp;|&nbsp; Guarantees shortest path (Manhattan distance)'
};
function updatePathInfo(){ pathInfo.innerHTML = PATH_COMPLEXITY[pathAlgoSelect.value]; }

let grid = [];
let cellEls = [];
let startNode, endNode;
let currentTool = 'wall';
let isMouseDown = false;
let wallDragValue = true;
let isVisualizing = false;

function buildGrid(){
  gridEl.innerHTML = '';
  grid = [];
  cellEls = [];
  for(let r = 0; r < ROWS; r++){
    const rowNodes = [];
    const rowEls = [];
    for(let c = 0; c < COLS; c++){
      const node = { row:r, col:c, isWall:false, isStart:false, isEnd:false,
                     distance:Infinity, fScore:Infinity, isVisited:false, previousNode:null };
      const el = document.createElement('div');
      el.className = 'cell';
      el.dataset.row = r;
      el.dataset.col = c;
      gridEl.appendChild(el);
      rowNodes.push(node);
      rowEls.push(el);
    }
    grid.push(rowNodes);
    cellEls.push(rowEls);
  }
  startNode = grid[Math.floor(ROWS/2)][Math.floor(COLS*0.2)];
  endNode   = grid[Math.floor(ROWS/2)][Math.floor(COLS*0.8)];
  startNode.isStart = true;
  endNode.isEnd = true;
  cellEls[startNode.row][startNode.col].classList.add('start');
  cellEls[endNode.row][endNode.col].classList.add('end');
}

function cellClass(node){
  const el = cellEls[node.row][node.col];
  el.className = 'cell';
  if(node.isWall) el.classList.add('wall');
  if(node.isStart) el.classList.add('start');
  if(node.isEnd) el.classList.add('end');
}

gridEl.addEventListener('mousedown', e => {
  if(isVisualizing) return;
  const cell = e.target.closest('.cell');
  if(!cell) return;
  const r = +cell.dataset.row, c = +cell.dataset.col;
  const node = grid[r][c];

  if(currentTool === 'wall'){
    if(node.isStart || node.isEnd) return;
    node.isWall = !node.isWall;
    wallDragValue = node.isWall;
    cellClass(node);
    isMouseDown = true;
  } else if(currentTool === 'start'){
    if(node.isEnd) return;
    grid[startNode.row][startNode.col].isStart = false;
    cellClass(grid[startNode.row][startNode.col]);
    node.isWall = false;
    node.isStart = true;
    startNode = node;
    cellClass(node);
  } else if(currentTool === 'end'){
    if(node.isStart) return;
    grid[endNode.row][endNode.col].isEnd = false;
    cellClass(grid[endNode.row][endNode.col]);
    node.isWall = false;
    node.isEnd = true;
    endNode = node;
    cellClass(node);
  }
});

gridEl.addEventListener('mouseover', e => {
  if(!isMouseDown || isVisualizing || currentTool !== 'wall') return;
  const cell = e.target.closest('.cell');
  if(!cell) return;
  const r = +cell.dataset.row, c = +cell.dataset.col;
  const node = grid[r][c];
  if(node.isStart || node.isEnd) return;
  node.isWall = wallDragValue;
  cellClass(node);
});

document.addEventListener('mouseup', () => { isMouseDown = false; });

toolBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    toolBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
  });
});

function resetGridState(){
  for(const row of grid){
    for(const node of row){
      node.distance = Infinity;
      node.fScore = Infinity;
      node.isVisited = false;
      node.previousNode = null;
      cellClass(node);
    }
  }
  pathMessage.textContent = '';
}

clearWallsBtn.addEventListener('click', () => {
  if(isVisualizing) return;
  for(const row of grid) for(const node of row) node.isWall = false;
  resetGridState();
});
clearPathBtn.addEventListener('click', () => { if(!isVisualizing) resetGridState(); });

function getNeighbors(node){
  const { row, col } = node;
  const neighbors = [];
  if(row > 0) neighbors.push(grid[row-1][col]);
  if(row < ROWS-1) neighbors.push(grid[row+1][col]);
  if(col > 0) neighbors.push(grid[row][col-1]);
  if(col < COLS-1) neighbors.push(grid[row][col+1]);
  return neighbors.filter(n => !n.isWall);
}

function bfs(){
  const visited = [];
  const queue = [startNode];
  startNode.isVisited = true;
  while(queue.length){
    const node = queue.shift();
    visited.push(node);
    if(node === endNode) break;
    for(const n of getNeighbors(node)){
      if(!n.isVisited){
        n.isVisited = true;
        n.previousNode = node;
        queue.push(n);
      }
    }
  }
  return visited;
}

function dfs(){
  const visited = [];
  const stack = [startNode];
  while(stack.length){
    const node = stack.pop();
    if(node.isVisited) continue;
    node.isVisited = true;
    visited.push(node);
    if(node === endNode) break;
    for(const n of getNeighbors(node)){
      if(!n.isVisited){
        n.previousNode = node;
        stack.push(n);
      }
    }
  }
  return visited;
}

function dijkstra(){
  const visited = [];
  startNode.distance = 0;
  const unvisited = [];
  for(const row of grid) for(const node of row) unvisited.push(node);

  while(unvisited.length){
    unvisited.sort((a, b) => a.distance - b.distance);
    const closest = unvisited.shift();
    if(closest.distance === Infinity) break;
    closest.isVisited = true;
    visited.push(closest);
    if(closest === endNode) break;
    for(const n of getNeighbors(closest)){
      const newDist = closest.distance + 1;
      if(newDist < n.distance){
        n.distance = newDist;
        n.previousNode = closest;
      }
    }
  }
  return visited;
}

function aStar(){
  const heuristic = n => Math.abs(n.row - endNode.row) + Math.abs(n.col - endNode.col);
  const visited = [];
  startNode.distance = 0;
  startNode.fScore = heuristic(startNode);
  const open = [startNode];
  const closed = new Set();

  while(open.length){
    open.sort((a, b) => a.fScore - b.fScore);
    const current = open.shift();
    if(closed.has(current)) continue;
    closed.add(current);
    current.isVisited = true;
    visited.push(current);
    if(current === endNode) break;
    for(const n of getNeighbors(current)){
      if(closed.has(n)) continue;
      const tentative = current.distance + 1;
      if(tentative < n.distance){
        n.distance = tentative;
        n.fScore = tentative + heuristic(n);
        n.previousNode = current;
        if(!open.includes(n)) open.push(n);
      }
    }
  }
  return visited;
}

function getShortestPath(){
  const path = [];
  let curr = endNode;
  while(curr !== null){
    path.unshift(curr);
    curr = curr.previousNode;
  }
  return path;
}

function getPathDelay(){ return Math.round(70 - (+pathSpeedRange.value) * 0.6); }

async function animate(visited, path){
  for(const node of visited){
    if(!node.isStart && !node.isEnd) cellEls[node.row][node.col].classList.add('visited');
    await sleep(getPathDelay());
  }
  if(path.length > 1 && path[0] === startNode){
    for(const node of path){
      if(!node.isStart && !node.isEnd) cellEls[node.row][node.col].classList.add('path');
      await sleep(getPathDelay() * 2);
    }
  } else {
    pathMessage.textContent = 'No path found — that target is walled off.';
  }
}

function setPathControlsDisabled(disabled){
  [pathAlgoSelect, pathSpeedRange, clearWallsBtn, clearPathBtn, visualizePathBtn].forEach(el => el.disabled = disabled);
  toolBtns.forEach(b => b.disabled = disabled);
}

visualizePathBtn.addEventListener('click', async () => {
  if(isVisualizing) return;
  isVisualizing = true;
  setPathControlsDisabled(true);
  resetGridState();

  const algo = pathAlgoSelect.value;
  let visited;
  if(algo === 'bfs') visited = bfs();
  else if(algo === 'dfs') visited = dfs();
  else if(algo === 'dijkstra') visited = dijkstra();
  else visited = aStar();

  const path = getShortestPath();
  await animate(visited, path);

  isVisualizing = false;
  setPathControlsDisabled(false);
});

pathAlgoSelect.addEventListener('change', updatePathInfo);

buildGrid();
updatePathInfo();