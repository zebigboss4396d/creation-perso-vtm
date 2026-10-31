import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {blank,derived,score,errors,powerAllowed,effectiveSkills} from '././engine.js';
import {ATTR,SKILLS,PROFILES,CLANS,POWERS,RITUALS} from '././data.js';
import {createDossierPdf,dossierData,wrapDossierText} from '././dossier-pdf.js';
function fixture(clan='ventrue',profile='equilibre'){const s=blank();s.identity={...s.identity,name:'Eleanor Walsh',concept:'Une infirmière obstinée',profession:'Infirmière'};s.embrace={...s.embrace,clan,sire:'M. Black',date:'Octobre 1940',confirmed:true,clanDetail:'Décision confirmée avec le conteur.'};ATTR.forEach(([id],i)=>s.attributes[id]=[4,3,3,3,2,2,2,2,1][i]);s.profile=profile;SKILLS.forEach(([id],i)=>s.skills[id]=PROFILES[profile].slots[i]||0);for(const id of ['artisanat','erudition','representation','sciences'])if(s.skills[id])s.specialties[id]='Un domaine précis';s.freeSpecialty={skill:SKILLS[0][0],text:'Pistolets'};s.disciplines={major:CLANS[clan].disc[0],minor:CLANS[clan].disc[1]};for(const d of [s.disciplines.major,s.disciplines.minor]){s.powers[d]=[];for(let i=0;i<score(s,d);i++){const p=POWERS.find(p=>p.disc===d&&p.level<=i+1&&powerAllowed(s,p)&&!s.powers[d].includes(p.id));s.powers[d].push(p.id);}}if(score(s,'sorcellerie'))s.ritual=RITUALS[0][0];s.traits=[{id:'ressources',level:3,detail:'Épargne accessible',efficacy:0,reliability:0},{id:'refuge',level:2,detail:'Appartement protégé',efficacy:0,reliability:0},{id:'contacts',level:2,detail:'Une collègue à l’hôpital',efficacy:0,reliability:0},{id:'empalement',level:2,detail:'',efficacy:0,reliability:0}];s.connections=[{conviction:'Ne jamais abandonner les miens',name:'Mary Walsh',relation:'Ma sœur incarne cette solidarité.'}];s.ambition='Protéger Mary';s.desire='Retrouver mon médecin';s.principles='Ne pas tuer les innocents.';return s;}
const dir=process.env.DOSSIER_QA_DIR||fs.mkdtempSync(path.join(os.tmpdir(),'vtm-dossier-'));fs.mkdirSync(dir,{recursive:true});
const assets={bodyFontBytes:fs.readFileSync('./assets/pdf/DejaVuSans.ttf'),titleFontBytes:fs.readFileSync('./assets/pdf/DejaVuSerif.ttf'),backgroundBytes:Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ1cAAAAASUVORK5CYII=','base64'))};
const complete=fixture('tremere');complete.identity={...complete.identity,name:'Éléonore D’Œuvre',concept:'Une infirmière obstinée qui protège les familles oubliées de son quartier de Chicago',birth:'14 mars 1908',age:'32 ans',appearance:'Une femme élancée au regard attentif. Un manteau sombre, des gants de laine et une cicatrice à la main.',history:'Avant l’Étreinte, elle travaillait à l’hôpital du quartier.',possessions:'Un carnet, une montre et une sacoche.',notes:'Le conteur doit confirmer les conditions de sa disparition.'};complete.disciplines={major:'sorcellerie',minor:'auspex'};complete.predator={...complete.predator,mode:'defined',style:'biberonneur',discipline:'sorcellerie',specialty:'rue',description:'Elle obtient du sang auprès d’un employé de l’hôpital. Une bande réclame le paiement d’une ancienne dette.'};complete.powers={sorcellerie:['gout','eteindre','scorpion'],auspex:['sens']};complete.ritual='eveil';complete.night={refuge:'Un appartement dont les fenêtres sont occultées.',mask:'Identité conservée ; absente pendant la journée.',possessions:'La sacoche et le carnet restent accessibles.'};
complete.connections=[{conviction:'Ne jamais abandonner les miens',name:'Mary Walsh',relation:'Sa sœur incarne la solidarité familiale.'},{conviction:'Tenir parole',name:'Louise Merle',relation:'Une collègue qui refuse les promesses faciles.'},{conviction:'Protéger les plus faibles',name:'Paul Morris',relation:'Un ami qui aide les familles du quartier.'}];assert.equal(errors(complete).flat().length,0);
complete.mask={...complete.mask,name:'Alice Couverture',activity:'Activité de couverture nocturne',documents:'DOCUMENT_MASQUE_ARCHIVES',risks:'RISQUE_MASQUE_EMPLOYEUR'};
complete.identity.nickname='SURNOM_IMPORTÉ';complete.identity.gender='Féminin';Object.assign(complete.connections[0],{origin:'ORIGINE_CONVICTION_IMPORTÉE',age:'52 ans',occupation:'FONCTION_ATTACHE_IMPORTÉE',description:'DESCRIPTION_ATTACHE_IMPORTÉE',location:'LIEU_ATTACHE_IMPORTÉ'});complete.relations=[{name:'RELATION_ROSE_IMPORTÉE',age:'47 ans',occupation:'LOGEUSE_IMPORTÉE',relation:'Ancienne camarade',description:'DESCRIPTION_ROSE_IMPORTÉE',support:'APPUI_ROSE_IMPORTÉ'}];
const long=structuredClone(complete);long.identity.appearance=('Une description détaillée comprenant vêtements, gestes, silhouette et marques particulières. ').repeat(35)+'FIN_APPARENCE';long.identity.notes=('Cette note très longue doit rester lisible et intégralement conservée dans le dossier. ').repeat(55)+'FIN_NOTES';long.connections[0].relation=('Mary rappelle à sa sœur pourquoi ses engagements ont de l’importance. ').repeat(25)+'FIN_ATTACHE';
const lamproie=fixture('gangrel');lamproie.predator={...lamproie.predator,mode:'defined',style:'lamproie',discipline:'proteisme',specialty:'furtivite',flaw:'hai',description:'La vitae est reçue contre des services. Une faction hostile la rejette.'};lamproie.powers.proteisme=['yeux'];
const hecata=fixture('hecata');hecata.disciplines={major:'neant',minor:'auspex'};hecata.powers={neant:['neant-cendres','neant-vision'],auspex:['sens']};hecata.ceremony='don-vie';
const lasombra=fixture('lasombra');lasombra.disciplines={major:'neant',minor:'domination'};lasombra.powers={neant:['neant-cape','neant-vision'],domination:['brouillage']};
const banu=fixture('banuhaqim');banu.disciplines={major:'sorcellerie',minor:'celerite'};banu.powers={sorcellerie:['gout','eteindre'],celerite:[POWERS.find(p=>p.disc==='celerite'&&p.level===1).id]};banu.ritual=RITUALS[0][0];
const cases={complete,long,lamproie,hecata,lasombra,banu,nosferatu:fixture('nosferatu'),blank:blank()},expected={};
for(const [name,s]of Object.entries(cases)){const result=await createDossierPdf(s,name==='blank'?{...assets,backgroundBytes:undefined}:assets);assert.ok(result.pageCount>=6);assert.ok(result.filename.endsWith('-dossier-v5.pdf'));assert.equal(result.data.stats.bloodPotency,derived(s).bloodPotency);fs.writeFileSync(path.join(dir,name+'.pdf'),result.bytes);expected[name]={draft:errors(s).flat().length>0,points:Object.values(s.attributes).reduce((a,b)=>a+b,0)+Object.values(effectiveSkills(s)).reduce((a,b)=>a+b,0)};}
assert.equal(dossierData(complete).disciplines[0].score,3);assert.equal(dossierData(complete).skills.rue,1);assert.equal(dossierData(lamproie).stats.humanity,6);assert.equal(dossierData(lamproie).stats.bloodPotency,2);assert.ok(dossierData(cases.nosferatu).traits.some(x=>x.id==='repoussant'&&x.source==='clan'));assert.deepEqual(wrapDossierText('ABCDEFGHIJKLMNOP',{widthOfTextAtSize:t=>t.length},9,4),['ABCD','EFGH','IJKL','MNOP']);
fs.writeFileSync(path.join(dir,'expected.json'),JSON.stringify(expected));
const check=spawnSync('python',['-c',String.raw`
import fitz,json,sys
from pathlib import Path
root=Path(sys.argv[1]);expected=json.loads((root/'expected.json').read_text())
for name,e in expected.items():
 d=fitz.open(root/(name+'.pdf'));alltext=' '.join(' '.join(p.get_text() for p in d).split())
 assert ('BROUILLON' in alltext)==e['draft'],name
 assert all(abs(p.rect.width-595.28)<.1 and abs(p.rect.height-841.89)<.1 for p in d),'Document A4'
 for section in ['VOTRE PERSONNAGE','ATTRIBUTS ET COMPÉTENCES','LE SANG ET LES POUVOIRS','PRÉDATION ET RESSOURCES','LIENS ET OBJECTIFS','L’EXISTENCE NOCTURNE']:assert section in alltext,(name,section)
 if name=='complete':
  for value in ['Éléonore D’Œuvre','Mary Walsh','Louise Merle','Paul Morris','cicatrice','Estomac de fer','Toucher du scorpion','Réveil avec la fraîcheur du soir','Un carnet, une montre et une sacoche.','Pistolets','marché noir','Sorcellerie du sang · 3','Alice Couverture','DOCUMENT_MASQUE_ARCHIVES','RISQUE_MASQUE_EMPLOYEUR','SURNOM_IMPORTÉ','ORIGINE_CONVICTION_IMPORTÉE','FONCTION_ATTACHE_IMPORTÉE','DESCRIPTION_ATTACHE_IMPORTÉE','LIEU_ATTACHE_IMPORTÉ','RELATION_ROSE_IMPORTÉE','LOGEUSE_IMPORTÉE','DESCRIPTION_ROSE_IMPORTÉE','APPUI_ROSE_IMPORTÉ']:
   assert value in alltext,(name,'Valeur absente',value)
 if name=='hecata':
  for value in ['Hecata','Néant','Don de vie factice','Guide du joueur']:assert value in alltext,(name,value)
 if name=='lasombra':assert 'Lasombra' in alltext and 'Vision du Néant' in alltext
 if name=='banu':assert 'Banu Haqim' in alltext and 'Le rituel initial' in alltext
 if name=='long':
  for value in ['FIN_APPARENCE','FIN_NOTES','FIN_ATTACHE']:assert value in alltext,('Texte perdu',value)
 if name=='lamproie':assert 'Puissance du sang finale : 2' in alltext and 'Humanité finale : 6' in alltext
 if name=='nosferatu':assert 'Repoussant' in alltext and 'imposé par le clan' in alltext
 circles=0
 for p in d:
  assert (len(p.get_images())==0 if name=='blank' else len(p.get_images())>=1),(name,'Fond personnalisé incorrect')
  if 'ATTRIBUTS ET COMPÉTENCES' in p.get_text():
   circles+=sum(1 for x in p.get_drawings() if x['fill'] and len(x['items'])==4 and x['items'][0][0]=='c' and x['rect'].width<7)
  for b in p.get_text('dict')['blocks']:
   for line in b.get('lines',[]):
    for s in line['spans']:
     r=fitz.Rect(s['bbox']);assert r.x0>=44 and r.x1<=p.rect.width-43,(name,'Texte hors largeur',s['text'])
     assert r.y0>25 and r.y1<820,(name,'Texte hors hauteur',s['text'])
 assert circles==e['points'],(name,'Scores mal représentés',circles,e['points'])
print('Dossier PDF : 8 personnages contrôlés, scores finaux, données, textes longs, formats et débordements vérifiés.')
`,dir],{encoding:'utf8'});if(check.status!==0)throw Error(check.stdout+check.stderr);console.log(check.stdout.trim());if(process.env.DOSSIER_QA_DIR)console.log(dir);else fs.rmSync(dir,{recursive:true,force:true});
