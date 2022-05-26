const md = new markdownit({html:true})
const image = document.querySelector('img')
const canvas = document.querySelector('canvas')
let glcanvas = fx.canvas()
canvas.parentNode.insertBefore(glcanvas,canvas)
canvas.style.display = 'none'
const ctx = canvas.getContext('2d')
const csv = `
ID,Prompt,Type,Variable,Choice 0 (Default),Choice 1,Choice 2,Choice 3,Choice 4
Begin,"MURICAN TRAILS _Version
An APUSH project by Vritti, Yingjia, Xing, and Andre",,,Role,,,,
Role,"Many kinds of people have done a road trip across America.
You may:
1. Be a middling history student with illusions of grandeur
2. ~~Be a recent graduate ready to gamble~~ AGE RESTRICTED
3. ~~Be but a humble public school teacher~~ AGE RESTRICTED",MC,MainCharacter,,Vritti,,,
Vritti,"What is the nickname of the first leader?
Vritti the",SA,Vritti,Yingjia,,,,
Yingjia,"What is the nickname of the second in command?
Yingjia the",SA,Yingjia,Xing,,,,
Xing,"What is the nickname of the third wheel?
Xing the",SA,Xing,Andre,,,,
Andre,"What is the nickname of the fourth student?
Andre the",SA,Andre,Buy0,,,,
Buy0,"Before leaving Arcadia you should buy equipment and supplies. You have $_Money in cash, but you don't have to spend it all now.",,,Buy1,,,,
Buy1,You can buy whatever you need at Paul's Lost and Found.,,,Buy2,,,,
Buy2,"Hello, I'm Paul. So you're going across America! I can fix you up with what you need:",,,Buy3,,,,
Buy3,"Paul's Lost and Found
1. Water bottle: $5.00
2. Nathan's food: $25.00
3. Keys to the schoolbus: $99.00",PURCHASE,,Steal0,5,25,99,
Steal0,"You spot a schoolbus sitting on Campus Drive.
1. Try your keys on the schoolbus.
2. Give Vritti the _Vritti your keys to try on the schoolbus.",MC,,,Steal1,Steal1,,
Steal1,"The keys work!
1. Steal the schoolbus
2. Not not steal the schoolbus",MC,,,Depart,Depart,,
Depart,Unfinished,,,,,,,
`

const data = Object.fromEntries(Papa.parse(csv).data
.map(([id,...rest])=>[id,rest]))

const output = document.querySelector('output')
const endings = {
  'MC': '\n<I>',
  'SA': ' <I>',
  '': '\n <button>PRESS SPACE TO CONTINUE</button>',
  'PURCHASE': '\nYou have $_Money.\nBuy an item: <I>\n<button>PRESS SPACE TO EXIT</button>'
}
const variables = {
  Version: '2022.05.26.1',
  Money: 1600,
  Items: {}
}
let input
let id, prompt, type, variable, choices

function start(_id){
  id = _id;
  ctx.clearRect(0,0,w,h);
  [prompt, type, variable, ...choices] = data[id]
  console.log(id,data[id],choices)
  image.src = `media/${id}.png`
  image.addEventListener('load',()=>{
    ctx.drawImage(image,0,0,w,h)
    setTimeout(render,10)
  })
  prompt += endings[type]
  write((prompt))

}
function clickListener(){
  switch(type){
    case '':
      start(choices[0])
      break
    case 'PURCHASE':
      start(choices[0])
      break
  }
}
function enterListener({key}){
  if(type == 'PURCHASE' && key == ' ') return clickListener()
  if(key != 'Enter') return
  if(variable) variables[variable] = input.value
  const num = parseInt(input.value)
  switch(type){
    case 'MC':
      if(choices[num]){
        start(choices[num])
      } else{
        write(('INVALID OPTION. PICK ANOTHER.\n'+prompt))
      }
      break
    case 'SA':
      start(choices[0])
      break
    case 'PURCHASE':
      if(variables.Money >= choices[num]) {
        variables.Money -= choices[num]
        write(("YOU BOUGHT ONE ITEM.\n"+prompt))
      } else {
        write(("YOU DON'T HAVE THE MONEY FOR THAT. PICK ANOTHER OR LEAVE MY STORE.\n"+prompt))
      }

      
      //if(item in variables.items) variables.items[item]++
      //else variables.items[item] = 0
  }

}
const wrap = (s) => s.replace(
    /(?![^\n]{1,60}$)([^\n]{1,60})\s/g, '$1\n'
);

function rrender(content){
  return md.render(
    content
    .replaceAll('\n','\n\n')
    .replaceAll('<I>','<input placeholder="...">')
    .replaceAll(/_(\w+)/g, (_,key) => variables[key] )
  )
}
let w = 800
let h = 600
function write(content){
  ctx.font = '20px "Press Start 2P"';

  let x = 0
  let y = 0
  let text = wrap(content)
  for(let i = 0; i<text.length; i++){
    let char = text[i]
    if(char == '\n'){
      x = 0
      y += 30
    } else {
      x += 20
      
      setTimeout((_c,_x,_y)=>{
        ctx.fillStyle = 'black'
        ctx.fillText(_c,_x+6,_y+6)
        ctx.fillStyle = 'white'
        ctx.fillText(_c,_x+4,_y+4)
      },i*10,char,x,y)
      if(i%5==0) setTimeout(render, i*10)
    }
  }

  button = document.querySelector('button')
  if(button) button.focus()

  input = document.querySelector('input')
  if(input) input.focus()

}

function render(){
    let texture = glcanvas.texture(canvas);
    texture.loadContentsOf(canvas);

      // Apply WebGL magic
    glcanvas.draw(texture)
        .bulgePinch(w/2, h/2, w*0.75, 0.12)
        .vignette(0.25, 0.74)
        .lensBlur(1.5,1,0)
        .brightnessContrast(0.1,0.1)
        .update();
}
document.addEventListener('keydown',enterListener)
document.addEventListener('click',clickListener)
start('Begin')

