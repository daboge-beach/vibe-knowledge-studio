const SCENES=[
 {a:0,draw(t){homeBackdrop();header('01','每一次来回，大脑都在成长','A SMALL EXCHANGE');exchange(t,ss(t,3.6,4.7),0,1-ss(t,1.8,4));note('日常互动示意 / Harvard · Serve and Return')}},
 {a:10.726,draw(t){titleCard(t,()=>neuralBrain(0,34,.73,0))}},
 {a:17.101,draw(t){dark();if(t<25.25)stage(()=>tubeFold(ss(t,21.5,24.8)));else shotBlend(ss(t,25.25,25.75),()=>{dark();stage(()=>tubeFold(1))},()=>{dark();stage(()=>longTube(ss(t,25.5,28.3)))});header('01','出生之前，已经开工','BEFORE BIRTH');note('发育过程示意 · 非等比例 / Gilbert · Developmental Biology')}},
 {a:29.2,draw(t){dark();header('02','一个细胞，找到另一个细胞','NEURONS MAKE CONNECTIONS');stage(()=>{neuralConnection(ss(t,29.8,35),t>35?(t-35)*.55:0,0);ruleLabel('细胞体',-209,P.muted,25);line([[-243,-170],[-243,-95]],'#c0c2a055',1.5);ruleLabel('突起伸长 → 末梢接近',V?240:207,P.gold,27)},V?1.03:1.25);note('神经元与连接 · 简化示意 / National Academies')}},
 {a:41.1,draw(t){homeBackdrop();header('03','出生以后，世界参与进来','EXPERIENCE SHAPES CIRCUITS');exchange(t,.95,ss(t,45.7,47.5),0);alpha(ss(t,49.4,50.4),()=>stage(()=>{neuralBrain(V?0:-555,V?-260:-55,.34,0)},1));note('遗传 × 经验 / Harvard · Brain Architecture')}},
 {a:53,draw(t){dark();header('04','有些连接加强，有些被修整','SYNAPTIC PRUNING');stage(()=>{neuralConnection(1,(t-53)*.66,ss(t,57.8,60.6));alpha(ss(t,61.3,62),()=>chip('突触修剪',0,V?248:205,260,P.gold))},V?1.05:1.25);note('连接变化示意 · 各脑区步调不同 / Harvard')}},
 {a:65,draw(t){dark();header('05','让信号，传得更高效','MYELINATION');stage(()=>myelin(t),V?1.02:1.3);note('髓鞘化与建连、修剪交叠进行 / Purves · Neuroscience')}},
 {a:77.1,draw(t){homeBackdrop();header('06','一座积木塔，也需要慢慢来','SKILLS DEVELOP AT DIFFERENT PACES');stage(()=>{blocksTower(ss(t,77.9,80.9),t);if(t>82)alpha(ss(t,82,83),()=>{const arr=['动作','语言','自控'];arr.forEach((s,i)=>chip(s,-250+i*250,-268,170,i===2?P.gold:P.teal))})});note('场景与能力步调示意 · 不用于测评孩子')}},
 {a:89.377,draw(t){dark();header('07','青春期，仍在继续调整','THE ADOLESCENT BRAIN');stage(()=>{const k=ss(t,97.6,99);save(()=>{g.translate(lerp(0,V?-100:-270,k),lerp(0,-40,k));g.scale(lerp(1,.70,k),lerp(1,.70,k));neuralBrain(0,0,1.0,ss(t,93.8,95));alpha(ss(t,94,95)*(1-k),()=>{line([[185,-75],[304,-150],[350,-150]],P.gold,2);text('前额叶',310,-188,27,P.gold)})});alpha(k,()=>{const px=V?245:385;bag(px+82.5,142.725,.75);person(px,255,1.1,{t,role:'dad',look:-.3,smile:true,right:[75,-159],rightElbow:[65,-192]})})});note('参与计划等功能的前额叶相对较晚成熟 / NIMH 2023')}},
 {a:101.1,draw(t){dark();header('08','成长，没有统一截止线','LEARNING CONTINUES THROUGH LIFE');stage(()=>timeline(t));note('阶段示意，非等距时间轴 / Harvard · NIMH')}},
 {a:111.956,draw(t){homeBackdrop();header('09','看见他，也回应他','RETURN TO THE EVERYDAY');exchange(t,.9,ss(t,112.8,114.3),.2);note('长大，藏在一次次来回里')}},
 {a:119.927,draw(t){references(t,['Harvard · Brain Architecture / Serve and Return','Gilbert · Developmental Biology','Purves · Neuroscience','NIMH · The Teen Brain · 2023'])}},
 {a:124.6,draw(t){ending(t)}}
];
