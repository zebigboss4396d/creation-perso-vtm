// Correspondance du dossier humain v1 ; aucune attribution automatique de points.
export const humanText=v=>typeof v==='string'?v:typeof v==='number'?String(v):'';
const text=humanText;
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const useful=v=>text(v).trim()&&!['Choisir…','Choisir un repère…','À préciser…'].includes(text(v).trim());
const sections=items=>items.filter(([,v])=>useful(v)).map(([label,v])=>label+' :\n'+text(v)).join('\n\n');
export function backgroundRoot(raw){if(!object(raw))return {};const nested=[raw.background,raw.data,raw.answers,raw.formData,raw.character,raw.personnage].filter(object);const fields=[raw,...nested].find(x=>object(x.fields));if(fields)return fields;if(raw.identity||raw.identite||['nom','name','fullname','nomComplet','concept','profession','age','connections','convictions','attachesConvictions'].some(k=>Object.hasOwn(raw,k)))return raw;return nested[0]||raw;}

export const BACKGROUND_GROUPS={
 skills:[['parcours','Études et apprentissage'],['professionType','Activité principale'],['professionSecondaire','Activité complémentaire'],['savoirfaire','Savoir-faire'],['evenement1','Premier événement'],['lecon1','Ce qu’il vous a appris'],['evenement2','Deuxième événement'],['lecon2','Ce qu’il vous a appris'],['loisir1','Premier loisir'],['loisir2','Deuxième loisir'],['loisir3','Troisième loisir'],['particularites','Talents, langues et fragilités']],
 means:[['niveauVie','Train de vie humain'],['revenus','Revenus et biens humains'],['logement','Logement humain'],['influence','Réputation humaine'],['renommee','Réputation (ancien champ)'],['difficultes','Dettes, ennemis et obstacles'],['secret','Secret'],['particularites','Talents, langues et fragilités']],
 life:[['milieuOrigine','Milieu d’enfance'],['origines','Origines et famille'],['parcours','Études et parcours'],['routine','Quotidien humain'],['appartenances','Communautés et convictions sociales'],['evenement1','Premier événement'],['lecon1','Leçon retenue'],['evenement2','Deuxième événement'],['lecon2','Leçon retenue'],['loisir1','Premier loisir'],['loisir2','Deuxième loisir'],['loisir3','Troisième loisir'],['autrePasse','Autre fait du passé'],['peur','Ce que vous craignez de perdre'],['contradiction','Contradiction intime']]
};
export function backgroundReferences(raw,group){const f=backgroundRoot(raw).fields||{};return (BACKGROUND_GROUPS[group]||[]).filter(([k])=>useful(f[k])).map(([key,label])=>({key,label,value:text(f[key])}));}
const role=(row,key)=>row[key]==='Autre'?(text(row[key+'Autre'])||'Autre'):text(row[key]);
export function normalizeRelations(rows){return Array.isArray(rows)?rows.filter(object).map(x=>({name:text(x.name||x.nom),age:text(x.age),occupation:text(x.occupation||x.fonction),relation:sections([['Nature du lien',role(x,x.role!==undefined?'role':'relation')],['Rencontre',x.rencontre]]),description:text(x.description),support:text(x.support||x.appui)})).filter(x=>Object.values(x).some(useful)).slice(0,30):[];}
export function mapBackground(raw){
 const root=backgroundRoot(raw),f=object(root.fields)?root.fields:null;
 // Ne jamais chercher récursivement dans les personnes, les prompts ou leurs exemples.
 const roots=[root.identity,root.identite,root.character?.identity,root.personnage?.identite,f,root,root.character,root.personnage].filter(object);
 const norm=k=>k.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
 const pick=keys=>{for(const scope of roots)for(const key of keys){const entry=Object.entries(scope).find(([k,v])=>norm(k)===key&&useful(v));if(entry)return {value:text(entry[1]),source:(scope===f?'fields.':'')+entry[0]};}return {value:'',source:''};};
 const entries=[],warnings=[];
 const add=(path,label,value,source)=>{if(Array.isArray(value)?value.length:useful(value))entries.push({path,label,value,source});};
 for(const [key,label,aliases]of [
 ['name','Nom',['fullname','nomcomplet','charactername','nompersonnage','name','nom']],['nickname','Surnom',['nickname','surnom']],['gender','Genre',['gender','genre']],['concept','Concept',['concept','conceptcentral','pitch']],['profession','Profession',['profession','metier','occupation']],['birth','Naissance',['birthdate','datedenaissance','naissance']],['age','Âge',['age']],['appearance','Apparence',['appearance','apparence','silhouettevisageetallure','physique']],['history','Histoire',['history','histoire','historique','backgroundtext']],['possessions','Possessions',['possessions','objetsutilesetpossessionshabituelles']],['notes','Notes au conteur',['notes','autreselementsadiscuteravecleconteur']]]){const p=pick(aliases);add('identity.'+key,label,p.value,p.source);}
 if(f){
  const set=(path,label,value,source)=>{const old=entries.findIndex(x=>x.path===path);if(useful(value)){if(old>=0)entries.splice(old,1);add(path,label,value,source);}};
  set('identity.appearance','Apparence et signes distinctifs',sections([['Silhouette, visage et allure',f.silhouette],['Vêtements et présentation',f.tenue],['Voix, gestes et habitudes',f.singularite]]),'fields.silhouette + tenue + singularite');
  set('identity.possessions','Possessions habituelles',sections([['Objets utiles et possessions habituelles',f.equipement],['Un objet auquel vous tenez',f.objetCher]]),'fields.equipement + objetCher');
  const main=text(f.profession)||(!text(f.professionType).startsWith('Choisir')?text(f.professionType):'');
  set('identity.profession','Profession et activité complémentaire',[main,useful(f.professionSecondaire)?'Activité complémentaire : '+f.professionSecondaire:''].filter(Boolean).join('\n\n'),'fields.profession + professionSecondaire');
 }
 const ageEntry=entries.find(x=>x.path==='identity.age');
 if(ageEntry&&(/^(?:\d{1,2}[/.]\d{1,2}[/.]\d{4}|\d{4}-\d{2}-\d{2})$/.test(ageEntry.value.trim())||/\b(?:17|18|19|20)\d{2}\b/.test(ageEntry.value)&&!/^\d{1,3}(?:\s*ans?)?$/i.test(ageEntry.value))){
  if(!entries.some(x=>x.path==='identity.birth'))add('identity.birth','Date de naissance',ageEntry.value,ageEntry.source);
  entries.splice(entries.indexOf(ageEntry),1);warnings.push('Le champ « Âge ou date de naissance » contient une date : elle est reprise comme naissance. L’âge à l’Étreinte reste à renseigner ; il n’est pas calculé sans sa date précise.');
 }
 for(const [path,label,aliases]of [['ambition','Ambition',['ambition','objectiflongterme']],['desire','Désir',['desir','desire']]]){const p=pick(aliases);add(path,label,p.value,p.source);}
 const rows=root.convictions||root.connections||root.convictionsAttaches||root.attachesConvictions||root.personnage?.attachesConvictions;
 if(Array.isArray(rows)){
 const pairs=rows.filter(object).filter(x=>[x.principe,x.conviction,x.value,x.valeur,x.nom,x.name,x.attache,x.lien,x.relation,x.incarne].some(useful)).map(x=>({conviction:text(x.principe||x.conviction||x.value||x.valeur),name:text(x.nom||x.name||x.attache),relation:sections([['Lien avec votre personnage',role(x,x.lien!==undefined?'lien':'relation')],['Ce que cette personne incarne',x.incarne]]),origin:text(x.origine||x.origin),age:text(x.age),occupation:text(x.fonction||x.occupation),description:text(x.description),location:text(x.lieu||x.location),living:x.vivant===true?'confirmed':x.vivant===false?'unconfirmed':text(x.living)}));
 if(pairs.length)add('connections','Convictions et Attaches',pairs.slice(0,3),'convictions / couples Conviction–Attache');
 if(pairs.length>3)warnings.push('Plus de trois couples : seuls les trois premiers sont repris dans la fiche ; les autres restent dans le dossier original.');
 if(rows.some(x=>x?.vivant===false))warnings.push('Au moins une Attache n’est pas confirmée comme personne humaine vivante. À vérifier avec le conteur.');
 }
 const relations=normalizeRelations(root.relations);if(relations.length)add('relations','Autres relations',relations,'relations');
 const references=['skills','means','life'].flatMap(group=>backgroundReferences(raw,group).map(x=>({...x,group})));
 const known=new Set(['nom','surnom','genre','age','concept','profession','professionSecondaire','silhouette','tenue','singularite','equipement','objetCher','notes','ambition','desir',...Object.values(BACKGROUND_GROUPS).flat().map(x=>x[0])]);
 const unmatched=f?Object.keys(f).filter(k=>useful(f[k])&&!known.has(k)):[];
 return {entries,warnings,references,unmatched};
}
export function applyBackground(state,raw,{overwrite=false}={}){
 const mapped=mapBackground(raw),report=[];
 const content=v=>Array.isArray(v)?v.some(x=>Object.values(x).some(useful)):useful(v);
 for(const entry of mapped.entries){const parts=entry.path.split('.'),key=parts.pop(),target=parts.reduce((o,k)=>o[k],state),old=target[key];const same=JSON.stringify(old)===JSON.stringify(entry.value);const kept=content(old)&&!overwrite&&!same;
 if(!kept)target[key]=entry.value;
 report.push({...entry,previous:old,status:kept?'kept':same?'same':'imported'});
 }
 return {...mapped,report};
}
