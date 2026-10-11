const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const h=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='estudio_algoritmia_v1';
let S={tests:[],fails:{test:[],vf:[]},ok:{test:[],vf:[]},seen:{test:[],vf:[]},gen:{},known:[],nbOk:0,nbTot:0};
try{S=Object.assign(S,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const topicName=id=>(TOPICS.find(t=>t.id===id)||{}).t||id;
let pdfDocs=[],nbCount=0,pdfSel=0;

// ---------- Navegación, tema, inicio ----------
$$('#menu nav button').forEach(b=>b.onclick=()=>{
  $$('#menu nav button').forEach(x=>x.classList.toggle('on',x===b));
  $$('.vista').forEach(v=>v.hidden=v.id!==b.dataset.v);
  if(b.dataset.v==='inicio')inicio(); if(b.dataset.v==='teoria')teoria('res'); if(b.dataset.v==='intentos')intentos();
});
if(localStorage.getItem('tema')==='d')document.body.classList.add('dark');
$('#tema').onclick=()=>{document.body.classList.toggle('dark');try{localStorage.setItem('tema',document.body.classList.contains('dark')?'d':'l')}catch(e){}};
$('#reset').onclick=()=>{if(confirm('¿Borrar todo el progreso?')){S={tests:[],fails:{test:[],vf:[]},ok:{test:[],vf:[]},seen:{test:[],vf:[]},gen:{},known:[],nbOk:0,nbTot:0};save();inicio()}};
function inicio(){
  const n=S.tests.length,avg=n?(S.tests.reduce((a,t)=>a+t.nota,0)/n).toFixed(1):'–';
  const card=(v,l)=>`<div class="card"><div class="big">${v}</div>${l}</div>`;
  $('#stats').innerHTML=card(n,'tests realizados')+card(avg,'nota media /10')+card(S.fails.test.length+S.fails.vf.length,'preguntas falladas pendientes')+
    card(S.known.length+' / '+TOPICS.reduce((a,t)=>a+t.defs.length,0),'flashcards dominadas')+card(S.nbOk+' / '+S.nbTot,'ejercicios práctica acertados')+
    `<div class="card"><b>Progreso de flashcards</b><div class="bar"><i style="width:${S.known.length*100/TOPICS.reduce((a,t)=>a+t.defs.length,0)}%"></i></div></div>`;
}

// ---------- Teoría ----------
$$('.tabs button').forEach(b=>b.onclick=()=>{$$('.tabs button').forEach(x=>x.classList.toggle('on',x===b));teoria(b.dataset.t)});
function teoria(m){
  const c=$('#teoriaCont');
  $$('#teoria .tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===m));
  if(m==='pdf'){const ds=pdfDocs.filter(d=>d.url&&d.use);
    if(!ds.length)c.innerHTML='<div class="card">Carga tus PDF con el botón de arriba para verlos aquí.</div>';
    else{if(pdfSel>=ds.length)pdfSel=0;const d=ds[pdfSel];
      c.innerHTML=`<div class="row">Documento: <select id="pdfSel">${ds.map((x,k)=>`<option value="${k}" ${k===pdfSel?'selected':''}>${h(x.name)}</option>`).join('')}</select><a href="${d.url}" target="_blank">Abrir en pestaña nueva</a></div>
      <iframe src="${d.url}" title="${h(d.name)}" style="width:100%;height:70vh;border:1px solid var(--bd);border-radius:8px;background:#fff"></iframe>
      ${d.ok?`<h3>Contenido de «${h(d.name)}» (${d.pages.length} páginas)</h3><p class="nota">Reconstruido a partir del PDF: títulos, listas y código se detectan por tamaño y tipo de letra, y pueden fallar (sobre todo en tablas). El visor de arriba es el original.</p>`+renderPdfText(d):'<p class="fb ko">No se pudo extraer texto de este PDF (¿escaneado?), pero puedes verlo arriba.</p>'}`;
      $('#pdfSel').onchange=e=>{pdfSel=+e.target.value;teoria('pdf')};}}
  if(m==='res')c.innerHTML=TOPICS.map(t=>`<div class="card"><h3>${h(t.t)}</h3><div class="mut">📄 ${h(t.doc)} · pág. ${t.pag}</div><p>${h(t.sum)}</p><p><b>Ejemplo:</b> ${h(t.ex)}</p></div>`).join('');
  if(m==='def')c.innerHTML=TOPICS.map(t=>`<div class="card"><h3>${h(t.t)} <span class="mut">(${h(t.doc)}, pág. ${t.pag})</span></h3>${t.defs.map(d=>`<p><b>${h(d[0])}:</b> ${h(d[1])}</p>`).join('')}</div>`).join('');
  if(m==='dif')c.innerHTML=DIFS.map(d=>`<div class="card"><b>${h(d[0])}</b><p>${h(d[1])}</p></div>`).join('');
  if(m==='fc')flash();
}
function flash(){
  const all=TOPICS.flatMap(t=>t.defs.map(d=>({k:t.id+'|'+d[0],q:d[0],a:d[1],src:`${t.doc}, pág. ${t.pag}`})));
  let deck=shuffle(all.filter(f=>!S.known.includes(f.k))),i=0,back=false;
  const c=$('#teoriaCont');
  const draw=()=>{
    if(!deck.length){c.innerHTML='<div class="card ok">¡Has dominado todas las flashcards! 🎉</div><button id="rf">Reiniciar</button>';$('#rf').onclick=()=>{S.known=[];save();flash()};return}
    const f=deck[i%deck.length];
    c.innerHTML=`<p class="mut">Pendientes: ${deck.length}. Pulsa la tarjeta para girarla.</p><div class="card fc">${back?h(f.a)+`<br><span class="mut">${h(f.src)}</span>`:'<b>'+h(f.q)+'</b>'}</div>
    <div class="row"><button id="s" class="sec">Aún no la sé</button><button id="k" class="pri">La sé</button></div>`;
    $('.fc').onclick=()=>{back=!back;draw()};
    $('#s').onclick=()=>{i++;back=false;draw()};
    $('#k').onclick=()=>{S.known.push(f.k);save();deck=deck.filter(x=>x!==f);back=false;draw()};
  };draw();
}

// ---------- Motor de test (A/B/C/D y V/F) ----------
function mkTest(root,kind,bank){
  const R=$(root),fk=kind==='vf'?'vf':'test';
  const mapItem=(x,i)=>kind==='vf'?{id:'v'+i,t:x.t,d:x.d,q:x.s,o:['Verdadero','Falso'],a:x.v?0:1,e:x.e+(x.v?'':' Redacción verdadera: «'+x.fix+'»')}:{id:'q'+i,...x};
  const items=bank.map(mapItem);
  const shufQ=q=>{if(kind==='vf')return q;const ix=shuffle([0,1,2,3]);return {...q,o:ix.map(i=>q.o[i]),a:ix.indexOf(q.a)}};
  const immediate=()=>['pr','all'].includes($('#m',R).value),isAll=()=>$('#m',R).value==='all';
  // Prioriza preguntas que no han salido en intentos recientes
  const pick=(l,n)=>{const seen=S.seen[fk]||[],fresh=shuffle(l.filter(x=>!seen.includes(x.id))),old=shuffle(l.filter(x=>seen.includes(x.id))),ch=fresh.concat(old).slice(0,n);
    S.seen[fk]=fresh.length>=n?seen.concat(ch.map(x=>x.id)):ch.map(x=>x.id);save();return ch};
  const repPool=ids=>items.concat(Object.values(S.gen||{}).filter(x=>x.k===fk)).filter(x=>ids.includes(x.id));
  const setup=()=>{
    const topics=[...new Set(bank.map(x=>x.t))];
    R.innerHTML=`<div class="card"><div class="row">Tema <select id="a"><option value="">Todos</option>${topics.map(t=>`<option value="${t}">${h(topicName(t))}</option>`).join('')}</select>
    Dificultad <select id="b"><option value="0">Todas</option><option value="1">Fácil</option><option value="2">Media</option><option value="3">Difícil</option></select>
    Fuente <select id="src"><option value="b">Banco preparado</option><option value="g">Generadas del temario y PDF cargados</option></select>
    ${kind==='vf'?'Afirmaciones <select id="w"><option value="">Todas</option><option value="f">Solo falsas</option><option value="v">Solo verdaderas</option></select>':''}
    Nº <input id="c" type="number" min="1" value="10" style="width:70px"> Modo <select id="m"><option value="ex">Examen (corrijo al final)</option><option value="all">Todas en una página (corrección inmediata)</option><option value="pr">Una a una (corrección inmediata)</option></select></div>
    <button id="go" class="pri">Empezar</button><p class="nota">Cada intento mezcla preguntas y respuestas, y prioriza las que no te han salido recientemente. Todo el contenido procede de tus PDF. El filtro de tema y dificultad solo afecta al banco preparado.</p></div>
    <div class="card"><b>Repetir preguntas</b><div class="row"><button id="rf">❌ Falladas (${repPool(S.fails[fk]).length})</button><button id="ra">✅ Acertadas (${repPool(S.ok[fk]).length})</button><button id="rt">🔁 Todas las del banco (${items.length})</button></div><p class="nota">Usan el modo elegido arriba.</p></div>`;
    $('#go',R).onclick=()=>{
      const want=kind==='vf'?$('#w',R).value:'',n=+$('#c',R).value||10;let l;
      if($('#src',R).value==='g'){l=kind==='vf'?genVF(want):genQuestions();if(l.length<4)return alert('Hacen falta al menos 4 conceptos.')}
      else l=items.filter(x=>(!$('#a',R).value||x.t===$('#a',R).value)&&(+$('#b',R).value===0||x.d===+$('#b',R).value)&&(want==='v'?x.a===0:want==='f'?x.a===1:true));
      if(!l.length)return alert('No hay preguntas con ese filtro.');
      run(pick(l,n),immediate(),isAll());
    };
    const rep=ids=>{const l=repPool(ids);if(!l.length)return alert('Todavía no hay preguntas en esta lista.');run(shuffle(l),immediate(),isAll())};
    $('#rf',R).onclick=()=>rep(S.fails[fk]);$('#ra',R).onclick=()=>rep(S.ok[fk]);$('#rt',R).onclick=()=>run(shuffle(items),immediate(),isAll());
  };
  const run=(list,prac,all)=>{
    list=list.map(shufQ);let i=0;const ans=Array(list.length).fill(null),L='ABCD';
    const optHtml=(q,k,lock,a)=>q.o.map((o,j)=>{let c=a===j?'sel':'';if(lock)c=j===q.a?'ok':(a===j?'ko':'');return `<button class="opt ${c}" data-q="${k}" data-k="${j}">${kind==='vf'?'':L[j]+') '}${h(o)}</button>`}).join('');
    const fbHtml=(q,a)=>`<div class="fb ${a===q.a?'ok':'ko'}">${a===q.a?'✅ Correcto.':'❌ Incorrecto. Respuesta correcta: <b>'+h(q.o[q.a])+'</b>.'}<br>${h(q.e)}</div>`;
    const draw=()=>{
      const q=list[i],a=ans[i],lock=prac&&a!==null;
      R.innerHTML=`<div class="bar"><i style="width:${(i+1)*100/list.length}%"></i></div><div class="mut">Pregunta ${i+1} de ${list.length} · ${h(topicName(q.t))}${prac?' · corrección inmediata':''}</div>
      <div class="card"><h3>${h(q.q)}</h3>${optHtml(q,i,lock,a)}${lock?fbHtml(q,a):''}</div>
      <div class="row"><button id="pv" ${i?'':'disabled'}>← Anterior</button><button id="nx" ${i<list.length-1?'':'disabled'}>Siguiente →</button><button id="fin" class="pri">Finalizar</button></div>`;
      $$('.opt',R).forEach(b=>b.onclick=()=>{if(lock)return;ans[i]=+b.dataset.k;draw()});
      $('#pv',R).onclick=()=>{i--;draw()};$('#nx',R).onclick=()=>{i++;draw()};$('#fin',R).onclick=confirmFin;
    };
    const drawAll=()=>{
      const done=ans.filter(x=>x!==null).length,ok=list.filter((q,k)=>ans[k]===q.a).length;
      R.innerHTML=`<div class="bar"><i style="width:${done*100/list.length}%"></i></div><div class="mut">Respondidas ${done}/${list.length} · ✅ ${ok} · ❌ ${done-ok}</div>`+list.map((q,k)=>{const a=ans[k],lock=a!==null;
        return `<div class="card"><div class="mut">${k+1}. ${h(topicName(q.t))}</div><h3>${h(q.q)}</h3>${optHtml(q,k,lock,a)}${lock?fbHtml(q,a):''}</div>`}).join('')+'<button id="fin" class="pri">Finalizar y ver nota</button>';
      $$('.opt',R).forEach(b=>b.onclick=()=>{const k=+b.dataset.q;if(ans[k]!==null)return;ans[k]=+b.dataset.k;const y=scrollY;drawAll();scrollTo(0,y)});
      $('#fin',R).onclick=confirmFin;
    };
    const confirmFin=()=>{if(ans.includes(null)&&!confirm('Hay preguntas sin responder (cuentan como fallo). ¿Finalizar?'))return;fin();scrollTo(0,0)};
    const fin=()=>{
      const ok=list.filter((q,k)=>ans[k]===q.a).length,n=list.length,nota=+(ok*10/n).toFixed(2);
      list.forEach((q,k)=>{const good=ans[k]===q.a;S.fails[fk]=S.fails[fk].filter(x=>x!==q.id);S.ok[fk]=S.ok[fk].filter(x=>x!==q.id);(good?S.ok:S.fails)[fk].push(q.id);if(q.gen){q.k=fk;S.gen[q.id]=q}});
      S.tests.push({kind,nota,n,ok,fecha:new Date().toLocaleString('es-ES'),det:list.map((q,k)=>({q:q.q,r:ans[k]===null?'(sin responder)':q.o[ans[k]],c:q.o[q.a],ok:ans[k]===q.a,e:q.e}))});
      if(S.tests.length>40)S.tests.shift();save();
      const bad=list.filter((q,k)=>ans[k]!==q.a);
      R.innerHTML=`<div class="card ${nota>=5?'ok':'ko'}"><div class="big">${nota} / 10</div><b>${nota>=5?'Aprobado':'Suspenso'}</b> · ✅ Aciertos: <b>${ok}</b> · ❌ Fallos: <b>${n-ok}</b> · Porcentaje: <b>${Math.round(ok*100/n)}%</b></div>
      <h3>Revisión de fallos</h3>${list.map((q,k)=>ans[k]===q.a?'':`<div class="card ko"><b>${h(q.q)}</b><br>Tu respuesta: ${ans[k]===null?'(sin responder)':h(q.o[ans[k]])}<br>Correcta: <b>${h(q.o[q.a])}</b><p>${h(q.e)}</p></div>`).join('')||'<div class="card ok">¡Sin fallos! 🎉</div>'}
      <div class="row"><button id="nuevo" class="pri">Nuevo test</button>${bad.length?'<button id="rbad">Repetir las falladas de este intento</button>':''}</div>`;
      $('#nuevo',R).onclick=setup;if(bad.length)$('#rbad',R).onclick=()=>run(bad,true,all);
    };
    all?drawAll():draw();
  };
  setup();
}
mkTest('#testRoot','test',QUIZ);mkTest('#vfRoot','vf',VF);

// ---------- PDF con PDF.js ----------
const rePdf=/^([A-ZÁÉÍÓÚ][^:.]{2,45}):\s(.{25,})$/;
const loadPdfs=async e=>{
  if(typeof pdfjsLib==='undefined'){$$('#pdfLista,#pdfListaT').forEach(b=>b.innerHTML='<div class="card ko">No se pudo cargar PDF.js: necesitas Internet para el CDN.</div>');return}
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  pdfDocs=[];const boxes=$$('#pdfLista,#pdfListaT');boxes.forEach(b=>b.innerHTML='');
  for(const f of e.target.files){
    const d={name:f.name,pages:[],lines:[],ok:false,use:true,url:URL.createObjectURL(f)};pdfDocs.push(d);
    try{
      const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;
      for(let p=1;p<=pdf.numPages;p++){
        const tc=await(await pdf.getPage(p)).getTextContent();
        d.pages.push(tc.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join(''));d.lines.push(pageLines(tc));
      }
      d.ok=d.pages.join('').trim().length>50; // pocas letras = probablemente escaneado
    }catch(err){d.err=err.message}
    const html=pdfDocs.map((x,k)=>`<div class="card ${x.ok?'':'ko'}"><label><input type="checkbox" data-k="${k}" ${x.use?'checked':''} ${x.ok?'':'disabled'}> <b>${h(x.name)}</b></label>
      <span class="mut">${x.ok?x.pages.length+' páginas leídas':'❌ No se pudo leer texto (¿escaneado o dañado?) '+h(x.err||'')}</span></div>`).join('');
    boxes.forEach(b=>b.innerHTML=html);$$('#pdfLista input,#pdfListaT input').forEach(c=>c.onchange=()=>{pdfDocs[c.dataset.k].use=c.checked;pdfRes();if($('#teoria .tabs .on').dataset.t==='pdf')teoria('pdf')});
    pdfRes();
  }
  $('#busca').hidden=false;if(e.target.id==='pdfsT'||$('#teoria .tabs .on').dataset.t==='pdf')teoria('pdf');
};
$('#pdfs').onchange=loadPdfs;$('#pdfsT').onchange=loadPdfs;
$('#busca').oninput=()=>pdfRes();
function pdfRes(){
  const q=$('#busca').value.trim().toLowerCase(),out=[];
  pdfDocs.filter(d=>d.ok&&d.use).forEach(d=>d.pages.forEach((txt,p)=>txt.split('\n').map(l=>l.trim()).forEach(l=>{
    const m=l.match(rePdf);if(m&&!/^(def|for|if|while|print)/.test(l))out.push({d:d.name,p:p+1,t:m[1],x:m[2]});
  })));
  const hits=[];
  if(q)pdfDocs.filter(d=>d.ok&&d.use).forEach(d=>d.pages.forEach((t,p)=>{if(t.toLowerCase().includes(q)){const i=t.toLowerCase().indexOf(q);hits.push(`<div class="card"><span class="mut">${h(d.name)} · pág. ${p+1}</span><br>…${h(t.slice(Math.max(0,i-80),i+160).replace(/\n/g,' '))}…</div>`)}}));
  $('#pdfRes').innerHTML=(q?`<h3>Coincidencias (${hits.length})</h3>`+hits.join(''):'')+`<h3>Definiciones detectadas automáticamente (${out.length})</h3><p class="nota">Detección simple por patrón «Término: explicación». Puede fallar; no es análisis con IA. Pulsa para ocultar/mostrar la explicación y repasar.</p>`+
    out.map(o=>`<div class="card"><b>${h(o.t)}</b> <span class="mut">${h(o.d)} · pág. ${o.p}</span><details><summary>Ver explicación</summary>${h(o.x)}</details></div>`).join('');
}

// ---------- Notebooks .ipynb ----------
const KW=[ // patrón, explicación, error habitual, qué cambiar
 [/\bprint\(/,'print(...) muestra valores en pantalla.','Olvidar paréntesis o comillas.','Cambia el texto o añade otro valor separado por comas.'],
 [/\bfor\b.*\bin\b.*:/,'for recorre una secuencia; el cuerpo se repite una vez por elemento.','Olvidar los dos puntos o la indentación.','Cambia el rango o la lista que se recorre.'],
 [/range\(/,'range(a,b) genera enteros desde a hasta b−1 (b no se incluye).','Esperar que range(5) incluya el 5.','Prueba range(1,6) o añade un paso: range(0,10,2).'],
 [/\bwhile\b/,'while repite mientras la condición sea verdadera.','No actualizar la variable: bucle infinito.','Cambia la condición o el incremento.'],
 [/\bif\b|\belif\b|\belse\b/,'Condicional: ejecuta un bloque solo si se cumple la condición.','Usar = en vez de == para comparar.','Prueba otros valores de entrada para ver qué rama se ejecuta.'],
 [/\bdef\b/,'def define una función con nombre y parámetros.','Olvidar return o los dos puntos.','Llama a la función con otros argumentos.'],
 [/\breturn\b/,'return devuelve un resultado y termina la función.','Usar print en lugar de return.','Devuelve otro valor y observa el efecto.'],
 [/\.append\(/,'append añade un elemento al final de una lista (la modifica).','Guardar el resultado: lista = lista.append(x) da None.','Añade varios elementos con un bucle.'],
 [/\blen\(/,'len(x) devuelve el número de elementos.','Usar el índice len(x) (fuera de rango).','Prueba con una lista vacía.'],
 [/\+=/,'x += y equivale a x = x + y (acumulador).','No inicializar el acumulador antes del bucle.','Cambia el valor inicial (0 suma, 1 producto).'],
 [/\/\/|%/,'// es división entera y % el resto.','Confundir / (decimal) con //.','Prueba con números negativos.'],
 [/\bimport\b|\bfrom\b.*\bimport\b/,'Importa una librería o función para usarla.','Escribir mal el nombre del módulo.','Importa solo lo que necesitas.'],
 [/\[.*:.*\]/,'Corte (slicing): selecciona un subconjunto [inicio:fin), fin no incluido.','Pensar que incluye el elemento fin.','Prueba índices negativos.'],
 [/\bmid\b|\/\/ ?2/,'Punto medio: base de divide y vencerás / búsqueda binaria.','Actualizar mal los límites y entrar en bucle infinito.','Cambia los límites y traza el valor de mid.']
];
const BLANK=['range','print','append','len','return','while','def','for','if','else','elif','mid','import'];
const md=t=>{
  t=t.replace(/\\[()\[\]]/g,'').replace(/\\(ldots|dots|cdots)/g,'…');
  let o='',inC=false;
  t.split('\n').forEach(l=>{
    if(l.trim().startsWith('```')){o+=inC?'</code></pre>':'<pre><code>';inC=!inC;return}
    if(inC){o+=h(l)+'\n';return}
    l=h(l).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
    const m=l.match(/^(#{1,4})\s+(.*)/);
    o+=m?`<h${m[1].length+2}>${m[2]}</h${m[1].length+2}>`:/^\s*[-*]\s/.test(l)?'<div>• '+l.replace(/^\s*[-*]\s/,'')+'</div>':l.trim()?'<p>'+l+'</p>':'';
  });return o;
};
const outText=c=>(c.outputs||[]).map(o=>o.output_type==='stream'?[].concat(o.text).join(''):o.output_type==='error'?o.ename+': '+o.evalue:o.data&&o.data['text/plain']?[].concat(o.data['text/plain']).join(''):'').join('').trim();
const norm=s=>s.replace(/\s+/g,' ').trim().toLowerCase();
const nbOutHtml=c=>(c.outputs||[]).map(o=>{
  if(o.output_type==='stream')return `<pre class="out">${h([].concat(o.text).join(''))}</pre>`;
  if(o.output_type==='error')return `<pre class="out" style="border-left-color:var(--ko)">${h(o.ename+': '+o.evalue)}</pre>`;
  const d=o.data||{};
  if(d['image/png'])return `<img alt="gráfico" src="data:image/png;base64,${[].concat(d['image/png']).join('').trim()}" style="max-width:100%;border-radius:8px">`;
  if(d['text/plain'])return `<pre class="out">${h([].concat(d['text/plain']).join(''))}</pre>`;
  return '';
}).join('');
// ---------- Kernel de Python real (Pyodide en un Web Worker) ----------
const PYHELPER=String.raw`
import sys, io, ast, traceback, builtins
_ns={'__name__':'__main__'}
def _input(p=''):
    raise EOFError('input() no está disponible en este entorno')
builtins.input=_input
def _run(code):
    out=io.StringIO(); old=(sys.stdout,sys.stderr); sys.stdout=out; sys.stderr=out
    res=None; err=None
    try:
        tree=ast.parse(code,'<cell>')
        last=None
        if tree.body and isinstance(tree.body[-1],ast.Expr):
            last=ast.Expression(tree.body.pop().value)
        exec(compile(tree,'<cell>','exec'),_ns)
        if last is not None:
            v=eval(compile(last,'<cell>','eval'),_ns)
            if v is not None: res=repr(v)
    except BaseException as e:
        if isinstance(e,SyntaxError):
            err='SyntaxError: '+str(e.msg)+' (línea '+str(e.lineno)+')'
        else:
            tb=[f for f in traceback.extract_tb(e.__traceback__) if f.filename=='<cell>']
            err=''.join('  línea '+str(f.lineno)+': '+(code.split(chr(10))[f.lineno-1].strip() if 0<f.lineno<=len(code.split(chr(10))) else '')+chr(10) for f in tb)+type(e).__name__+': '+str(e)
    finally:
        sys.stdout,sys.stderr=old
    return [out.getvalue(),res,err]
`;
const WORKER=`importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
let py;const ready=(async()=>{py=await loadPyodide();py.runPython(${JSON.stringify(PYHELPER)});postMessage({type:'ready'})})();
onmessage=async e=>{await ready;const {id,code}=e.data;
 try{try{await py.loadPackagesFromImports(code)}catch(_){}
  const r=py.globals.get('_run')(code);const [out,val,err]=r.toJs();if(r.destroy)r.destroy();postMessage({id,out,val,err})}
 catch(x){postMessage({id,out:'',val:null,err:String(x)})}};`;
let kernel=null,kReady=null,seq=0,pending={},kStatus='Python se cargará al ejecutar la primera celda',execN=0;
const setStatus=t=>{kStatus=t;const el=$('#kst');if(el)el.textContent=t};
function stopKernel(msg){
  if(kernel){kernel.terminate();kernel=null}
  Object.values(pending).forEach(f=>f({out:'',val:null,err:msg||'Ejecución interrumpida.'}));pending={};
  setStatus('⚪ Python detenido (se reiniciará al ejecutar)');
}
function startKernel(){
  if(kernel)kernel.terminate();
  setStatus('⏳ Cargando Python (~10 MB desde Internet la primera vez)…');
  const w=kernel=new Worker(URL.createObjectURL(new Blob([WORKER],{type:'text/javascript'})));
  kReady=new Promise((res,rej)=>{
    w.onmessage=e=>{if(e.data.type==='ready'){setStatus('🟢 Python listo');res();return}
      const p=pending[e.data.id];if(p){delete pending[e.data.id];p(e.data)}};
    w.onerror=()=>{setStatus('🔴 No se pudo cargar Python. Comprueba tu conexión a Internet.');if(kernel===w)kernel=null;rej(new Error('kernel'))};
  });
  kReady.catch(()=>{});
}
const runCode=code=>{
  if(!kernel)startKernel();
  const w=kernel;
  return kReady.then(()=>new Promise(res=>{const id=++seq;pending[id]=res;w.postMessage({id,code})}))
    .catch(()=>({out:'',val:null,err:'No se pudo cargar Python: comprueba tu conexión a Internet (Pyodide se descarga del CDN) y pulsa Reiniciar.'}));
};
const srcKey=n=>'nbsrc:'+n;
const savedSrc=n=>{try{return JSON.parse(localStorage.getItem(srcKey(n))||'{}')}catch(e){return {}}};
const runCell=(c,i,name)=>{
  const src0=[].concat(c.source||[]).join('');
  if(c.cell_type==='markdown')return `<div class="card">${md(src0)}</div>`;
  if(c.cell_type!=='code')return '';
  const sv=savedSrc(name)[i],src=sv!==undefined?sv:src0;
  return `<div class="nbcell" data-name="${h(name)}" data-i="${i}"><div class="row"><button class="run pri">▶ Ejecutar</button><span class="mut ec">[ ]</span></div><textarea class="src" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" wrap="off" rows="${Math.max(2,src.split('\n').length+1)}">${h(src)}</textarea><div class="outs">${nbOutHtml(c)}</div></div>`;
};
// ---------- Editor de código: sangría, pares, deshacer correcto ----------
const insTxt=(ta,t)=>{ta.focus();if(!document.execCommand('insertText',false,t)){ta.setRangeText(t,ta.selectionStart,ta.selectionEnd,'end');ta.dispatchEvent(new Event('input'))}};
const delSel=ta=>{ta.focus();if(!document.execCommand('delete')){ta.setRangeText('',ta.selectionStart,ta.selectionEnd,'end');ta.dispatchEvent(new Event('input'))}};
const fitTa=ta=>{const y=scrollY;ta.style.height='auto';ta.style.height=(ta.scrollHeight+2)+'px';scrollTo(0,y)};
function lineOp(ta,fn){
  const v=ta.value,s=ta.selectionStart,e=ta.selectionEnd,had=s!==e;
  const ls=v.lastIndexOf('\n',s-1)+1;let le=v.indexOf('\n',e>s&&v[e-1]==='\n'?e-1:e);if(le<0)le=v.length;
  const block=v.slice(ls,le),nb=fn(block.split('\n')).join('\n');
  ta.setSelectionRange(ls,le);insTxt(ta,nb);
  if(had)ta.setSelectionRange(ls,ls+nb.length);else{const c=Math.max(ls,s+nb.length-block.length);ta.setSelectionRange(c,c)}
}
const PAIRS={'(':')','[':']','{':'}','"':'"',"'":"'"};
function editorKeys(e,ta){
  if(e.isComposing||(e.ctrlKey&&e.key!=='/')||(e.metaKey&&e.key!=='/'))return;
  const v=ta.value,s=ta.selectionStart,en=ta.selectionEnd;
  if(e.key==='Enter'&&!e.shiftKey&&!e.altKey){
    e.preventDefault();
    const before=v.slice(v.lastIndexOf('\n',s-1)+1,s);let ind=before.match(/^ */)[0];
    if(/:\s*$/.test(before))ind+='    ';
    else if(/^\s*(return|pass|break|continue|raise)\b/.test(before)&&ind.length>=4)ind=ind.slice(0,-4);
    insTxt(ta,'\n'+ind);return;
  }
  if(e.key==='Tab'){
    e.preventDefault();
    if(e.shiftKey)lineOp(ta,ls=>ls.map(l=>l.replace(/^( {1,4}|\t)/,'')));
    else if(s!==en&&v.slice(s,en).includes('\n'))lineOp(ta,ls=>ls.map(l=>l.trim()?'    '+l:l));
    else{const col=s-(v.lastIndexOf('\n',s-1)+1);insTxt(ta,' '.repeat(4-col%4))}
    return;
  }
  if(e.key==='/'&&(e.ctrlKey||e.metaKey)){
    e.preventDefault();
    lineOp(ta,ls=>{const ne=ls.filter(l=>l.trim()),all=ne.length&&ne.every(l=>/^\s*#/.test(l));
      if(all)return ls.map(l=>l.replace(/^(\s*)# ?/,'$1'));
      const m=Math.min(...ne.map(l=>l.match(/^ */)[0].length),1e9);return ls.map(l=>l.trim()?l.slice(0,m)+'# '+l.slice(m):l)});
    return;
  }
  if(e.key==='Backspace'&&s===en&&s>0){
    const ls=v.lastIndexOf('\n',s-1)+1,before=v.slice(ls,s);
    if(before&&/^ +$/.test(before)){e.preventDefault();ta.setSelectionRange(s-(before.length%4||4),s);delSel(ta);return}
    if(PAIRS[v[s-1]]&&v[s]===PAIRS[v[s-1]]){e.preventDefault();ta.setSelectionRange(s-1,s+1);delSel(ta);return}
    return;
  }
  if(e.altKey||e.key.length!==1)return;
  const nx=v[en],pv=v[s-1]||'';
  if([')',']','}','"',"'"].includes(e.key)&&s===en&&nx===e.key){e.preventDefault();ta.setSelectionRange(s+1,s+1);return}
  if(PAIRS[e.key]){
    if(s!==en){e.preventDefault();insTxt(ta,e.key+v.slice(s,en)+PAIRS[e.key]);return}
    const q=e.key==='"'||e.key==="'";
    if(nx&&/\w/.test(nx))return;
    if(q&&/\w/.test(pv)&&!/(^|\W)[frbuFRBU]$/.test(v.slice(0,s)))return;
    e.preventDefault();insTxt(ta,e.key+PAIRS[e.key]);ta.setSelectionRange(s+1,s+1);
  }
}
function wireRun(){
  const cells=$$('.nbcell');
  const runOne=async el=>{
    const ta=$('.src',el),btn=$('.run',el),ec=$('.ec',el),outs=$('.outs',el);
    btn.disabled=true;ec.textContent='[*]';
    const r=await runCode(ta.value);
    ec.textContent=r.err&&/interrump/i.test(r.err)?'[ ]':'['+(++execN)+']';
    const txt=(r.out||'')+(r.val!=null?((r.out&&!r.out.endsWith('\n')?'\n':'')+r.val):'');
    outs.innerHTML=(txt?`<pre class="out">${h(txt)}</pre>`:'')+(r.err?`<pre class="out err">${h(r.err)}</pre>`:'');
    btn.disabled=false;return !r.err;
  };
  const saveSrc=el=>{const n=el.dataset.name,o=savedSrc(n);o[el.dataset.i]=$('.src',el).value;try{localStorage.setItem(srcKey(n),JSON.stringify(o))}catch(e){}};
  cells.forEach((el,k)=>{
    const ta=$('.src',el);
    $('.run',el).onclick=()=>runOne(el);
    fitTa(ta);
    ta.oninput=()=>{fitTa(ta);saveSrc(el)};
    ta.onkeydown=e=>{
      if(e.key==='Enter'&&(e.shiftKey||e.ctrlKey||e.metaKey)){e.preventDefault();runOne(el).then(()=>{if(e.shiftKey&&cells[k+1])$('.src',cells[k+1]).focus()});return}
      editorKeys(e,ta);
    };
  });
  if(document.fonts)document.fonts.ready.then(()=>cells.forEach(el=>fitTa($('.src',el))));
  if(!$('#runAll'))return;
  $('#runAll').onclick=async()=>{for(const el of cells){if(!(await runOne(el)))break}};
  $('#stopK').onclick=()=>{stopKernel();$$('.nbcell .run').forEach(b=>b.disabled=false)};
  $('#restK').onclick=()=>{stopKernel('Ejecución interrumpida.');execN=0;$$('.nbcell .ec').forEach(x=>x.textContent='[ ]');startKernel()};
  $('#resetNb').onclick=()=>{if(confirm('¿Borrar tus cambios y volver al código original del notebook?')){nbs.forEach(x=>{try{localStorage.removeItem(srcKey(x.name))}catch(e){}});renderNb()}};
}
let nbs=[];
const renderNb=()=>{
  const ex=$('#examen').checked,tools=$('#herr').checked||ex;
  const bar=nbs.length&&!tools?`<div class="card nbbar"><div class="row"><button id="runAll" class="pri">▶▶ Ejecutar todas</button><button id="stopK">⏹ Detener</button><button id="restK">↻ Reiniciar Python</button><button id="resetNb" class="sec">Restaurar originales</button><span id="kst" class="mut">${h(kStatus)}</span></div><p class="nota">El código se ejecuta de verdad en tu navegador (Python con Pyodide; necesita Internet para descargarlo la primera vez). Mayús+Intro ejecuta la celda y pasa a la siguiente. Tus cambios se guardan en este navegador. Si un bucle no termina, pulsa Detener.</p></div>`:'';
  $('#nbCont').innerHTML=bar+nbs.map((x,fid)=>x.err?`<div class="card ko">No se pudo leer ${h(x.name)} como notebook (.ipynb).</div>`:
    `<h3>📓 ${h(x.name)} (${x.nb.cells.length} celdas)</h3>`+x.nb.cells.map((c,i)=>tools?cell(c,i,fid,ex):runCell(c,i,x.name)).join('')).join('');
  if(tools)wireNb();else wireRun();
};
$('#nbFile').onchange=async e=>{
  nbs=[];stopKernel();execN=0;
  for(const f of e.target.files){try{const nb=JSON.parse(await f.text());if(!Array.isArray(nb.cells))throw 0;nbs.push({name:f.name,nb})}catch(err){nbs.push({name:f.name,err:1})}}
  renderNb();
  if(!$('#herr').checked&&!$('#examen').checked&&nbs.some(x=>!x.err))startKernel();
};
$('#herr').onchange=renderNb;$('#examen').onchange=renderNb;
function cell(c,i,fid,ex){
  const src=[].concat(c.source||[]).join('');
  if(c.cell_type==='markdown')return `<div class="card">${md(src)}</div>`;
  if(c.cell_type!=='code'||!src.trim())return '';
  const out=outText(c),id=fid+'_'+i;
  const hits=KW.filter(k=>k[0].test(src));
  const lines=src.split('\n').filter(l=>l.trim()&&!l.trim().startsWith('#')).map((l,n)=>{const k=KW.find(k=>k[0].test(l));return `<div><code>${h(l.trim())}</code> → ${k?h(k[1]):'Asignación o expresión: guarda o calcula un valor.'}</div>`}).join('');
  const bl=BLANK.find(b=>new RegExp('\\b'+b+'\\b').test(src));
  const clozed=bl?src.replace(new RegExp('\\b'+bl+'\\b'),'_____'):'';
  return `<div class="card"><b>Celda ${i+1} (código)</b><pre><code>${h(src)}</code></pre>
    ${out&&!ex?`<pre class="out">${h(out)}</pre>`:''}
    <details ${ex?'':'open'}><summary>Explicación paso a paso</summary>${lines}
      ${hits.length?'<p><b>Errores habituales:</b></p>'+hits.map(k=>'<div>⚠ '+h(k[2])+'</div>').join('')+'<p><b>Prueba a cambiar:</b></p>'+hits.map(k=>'<div>✏️ '+h(k[3])+'</div>').join(''):''}</details>
    ${out?`<div class="card" data-out="${h(out)}" data-id="${id}"><b>¿Qué resultado produce?</b><textarea rows="2"></textarea><div class="row"><button class="hint sec">💡 Pista</button><button class="chk pri">Comprobar</button></div><div class="msg"></div></div>`:''}
    ${clozed?`<div class="card" data-bl="${bl}"><b>Completa el código</b><pre><code>${h(clozed)}</code></pre><div class="row"><input type="text" placeholder="¿qué falta en _____?"><button class="chk2 pri">Comprobar</button><button class="hint2 sec">💡 Pista</button></div><div class="msg"></div></div>`:''}</div>`;
}
function wireNb(){
  $$('[data-out]').forEach(d=>{let n=0;const out=d.dataset.out,m=$('.msg',d),lines=out.split('\n');
    $('.hint',d).onclick=()=>{n++;m.innerHTML=n===1?`<i>Pista 1: la salida tiene ${lines.length} línea(s).</i>`:n===2?`<i>Pista 2: empieza por «${h(lines[0].slice(0,Math.ceil(lines[0].length/2)))}…»</i>`:`<b>Solución:</b><pre class="out">${h(out)}</pre>`};
    $('.chk',d).onclick=()=>{const ok=norm($('textarea',d).value)===norm(out);S.nbTot++;if(ok)S.nbOk++;save();m.innerHTML=ok?'<div class="fb ok">✅ Correcto</div>':'<div class="fb ko">❌ No coincide. Salida guardada:<pre class="out">'+h(out)+'</pre>Revisa el orden de las instrucciones y qué imprime cada una.</div>'}});
  $$('[data-bl]').forEach(d=>{const b=d.dataset.bl,m=$('.msg',d);
    $('.hint2',d).onclick=()=>m.innerHTML=`<i>Pista: tiene ${b.length} letras y empieza por «${b[0]}».</i>`;
    $('.chk2',d).onclick=()=>{const ok=$('input',d).value.trim()===b;S.nbTot++;if(ok)S.nbOk++;save();m.innerHTML=ok?'<div class="fb ok">✅ Correcto</div>':'<div class="fb ko">❌ Incorrecto. Era <b>'+h(b)+'</b>.</div>'}});
}
inicio();

// ---------- Generador automático (plantillas, NO es IA) ----------
function pdfDefs(){
  const out=[];
  pdfDocs.filter(d=>d.ok&&d.use).forEach(d=>d.pages.forEach((txt,p)=>txt.split('\n').map(l=>l.trim()).forEach(l=>{
    const m=l.match(rePdf);
    if(m&&m[1].split(' ').length<=4&&m[2].length<=220&&!/^(def|for|if|while|print|Ejemplo|Ejercicio|Caso|Paso)/.test(l))out.push({d:d.name,p:p+1,t:m[1],x:m[2]});
  })));
  return out;
}
function defPool(){
  const pool=TOPICS.flatMap(t=>t.defs.map(d=>({term:d[0],def:d[1],src:t.doc+', pág. '+t.pag,t:t.id})));
  pdfDefs().forEach(o=>{if(!pool.some(p=>norm(p.term)===norm(o.t)))pool.push({term:o.t,def:o.x,src:o.d+', pág. '+o.p,t:'pdf'})});
  return pool;
}
function genQuestions(){
  const pool=defPool();
  return pool.map(p=>{
    const rev=Math.random()<.5,opts=shuffle([p,...shuffle(pool.filter(x=>x.term!==p.term)).slice(0,3)]);
    return {id:'g:'+p.term+(rev?'r':'d'),gen:1,t:p.t,d:2,
      q:rev?`¿Qué concepto corresponde a esta definición? «${p.def}»`:`¿Cuál es la definición correcta de «${p.term}»?`,
      o:opts.map(x=>rev?x.term:x.def),a:opts.indexOf(p),
      e:`${p.term}: ${p.def} (Fuente: ${p.src}). Las otras opciones corresponden a otros conceptos del temario.`};
  });
}
function genVF(want){
  const pool=defPool();
  return pool.map(p=>{
    const v=want==='v'?true:want==='f'?false:Math.random()<.5,o=shuffle(pool.filter(x=>x.term!==p.term))[0];
    return {id:'gv:'+p.term+(v?'t':'f'),gen:1,t:p.t,d:2,q:`«${p.term}» se corresponde con esta definición: ${(v?p:o).def}`,o:['Verdadero','Falso'],a:v?0:1,
      e:`La definición de «${p.term}» es: ${p.def} (Fuente: ${p.src}).`+(v?'':` La definición del enunciado pertenece a «${o.term}». Redacción verdadera: «${p.term}» se corresponde con: ${p.def}`)};
  });
}
function intentos(){
  const list=S.tests.map((t,i)=>({...t,i})).reverse(),ap=list.filter(t=>t.nota>=5).length;
  $('#intentosCont').innerHTML=`<div class="grid"><div class="card"><div class="big">${list.length}</div>intentos</div><div class="card ok"><div class="big">${ap}</div>aprobados (nota ≥ 5)</div><div class="card ko"><div class="big">${list.length-ap}</div>suspensos</div></div>`+
  (list.length?list.map(t=>`<div class="card"><div class="row"><b>${t.kind==='vf'?'Verdadero/Falso':'Test A/B/C/D'}</b><span class="mut">${h(t.fecha||'')}</span><span class="fb ${t.nota>=5?'ok':'ko'}" style="margin:0;padding:3px 12px">${t.nota>=5?'Aprobado':'Suspenso'} · ${t.nota}/10 · ${t.ok}/${t.n}</span></div>
    ${t.det?`<details><summary>Ver las ${t.n} preguntas</summary>${t.det.map(d=>`<div class="fb ${d.ok?'ok':'ko'}"><b>${h(d.q)}</b><br>Tu respuesta: ${h(d.r)}${d.ok?'':'<br>Correcta: <b>'+h(d.c)+'</b><br>'+h(d.e)}</div>`).join('')}</details>`:'<p class="nota">Sin detalle (intento anterior a esta versión).</p>'}</div>`).join(''):'<div class="card">Aún no has hecho ningún test. Tus intentos aparecerán aquí.</div>');
}
// ---------- Reconstrucción legible del texto del PDF ----------
function pageLines(tc){
  const ls=[];
  tc.items.forEach(it=>{
    if(!it.str)return;
    const y=it.transform[5],x=it.transform[4],sz=Math.round(Math.abs(it.transform[0])*2)/2;
    let L=ls.find(l=>Math.abs(l.y-y)<2.5);if(!L){L={y,its:[]};ls.push(L)}
    L.its.push({x,w:it.width,s:it.str,sz,mono:/mono|courier/i.test((tc.styles[it.fontName]||{}).fontFamily||'')});
  });
  return ls.sort((a,b)=>b.y-a.y).map(L=>{
    L.its.sort((a,b)=>a.x-b.x);let t='',end=null;
    L.its.forEach(i=>{if(end!==null&&i.x-end>1&&!/^\s/.test(i.s)&&!/\s$/.test(t))t+=' ';t+=i.s;end=i.x+i.w});
    const nb=L.its.filter(i=>i.s.trim()),big=nb.length?nb.reduce((a,b)=>b.s.trim().length>a.s.trim().length?b:a):L.its[0];
    return {y:L.y,x:L.its[0].x,t,sz:big.sz,mono:nb.length>0&&nb.every(i=>i.mono)};
  }).filter(l=>l.t.trim());
}
function renderPdfText(d){
  const all=d.lines.flat(),sz={};all.forEach(l=>{if(!l.mono)sz[l.sz]=(sz[l.sz]||0)+l.t.length});
  const body=+(Object.entries(sz).sort((a,b)=>b[1]-a[1])[0]||[11])[0];
  const nm=t=>t.replace(/\d+/g,'#'),cnt={};
  d.lines.forEach(pg=>new Set(pg.map(l=>nm(l.t.trim()))).forEach(t=>cnt[t]=(cnt[t]||0)+1));
  const codeRe=/^(def |for .+ in |if .+:|elif |else:|while |return\b|print\(|import |from \w+ import|[A-Za-z_]\w*(\[.*\])?\s*(\+=|-=|\*=|\/\/=|=)\s*\S)/;
  const bulRe=/^\s*([•▪·\-–*]|\d+[.)])\s+/;
  const lblRe=/^(Importante|Cuidado|Pregunta|Idea|Regla|Nota|Muy importante|Mantra|Qué debes|Qué quiero|Respuesta|Formato|Hilo|Conexión|No significa|Lectura|Cambio|Nueva idea|No existe|Dos palabras|Esquema|Primera|Objetivo|Primero|No estamos|No mires|Versión|Ejemplo|Ejercicio)/;
  return d.lines.map((pg,p)=>{
    const blocks=[];let cur=null,prev=null;
    pg.filter(l=>!(d.lines.length>=3&&cnt[nm(l.t.trim())]>=d.lines.length*.6)).forEach(l=>{
      const t=l.t.trim();if(!t)return;
      const near=prev&&(prev.y-l.y)<=l.sz*1.9;let type;
      if(l.sz>=body*1.3)type='h2';else if(l.sz>=body*1.12)type='h3';
      else if(l.mono||(l.sz<=body*1.05&&codeRe.test(t))||(cur&&cur.type==='code'&&near&&(/^\s/.test(l.t)||l.x>cur.x0+1)))type='code';
      else if(bulRe.test(t))type='li';else if(t.length<=45&&lblRe.test(t))type='lbl';else type='p';
      if(cur&&near&&cur.type===type&&type!=='li'&&type!=='lbl')cur.lines.push(l);
      else if(cur&&near&&cur.type==='li'&&type==='p')cur.lines.push(l);
      else{cur={type,lines:[l],x0:l.x};blocks.push(cur)}
      prev=l;
    });
    const html=blocks.map(b=>{
      const tx=b.lines.map(l=>l.t.trim()).join(' ');
      if(b.type==='h2')return `<h3 class="pt-h2">${h(tx)}</h3>`;
      if(b.type==='h3')return `<h4 class="pt-h3">${h(tx)}</h4>`;
      if(b.type==='lbl')return `<div class="pt-lbl">${h(tx)}</div>`;
      if(b.type==='code'){const mx=Math.min(...b.lines.map(l=>l.x)),cw=body*.6;
        return '<pre><code>'+b.lines.map(l=>' '.repeat(l.t.match(/^ */)[0].length+Math.max(0,Math.round((l.x-mx)/cw)))+h(l.t.trim())).join('\n')+'</code></pre>'}
      if(b.type==='li')return `<div class="pt-li"><span>•</span><div>${h(tx.replace(bulRe,''))}</div></div>`;
      return `<p>${h(tx)}</p>`;
    }).join('');
    return `<div class="card pdft"><div class="mut pt-pg">Página ${p+1}</div>${html}</div>`;
  }).join('');
}
