let data
let audio = new Audio()
const dash = '\t'.repeat(8)
const endings = {
	'MC': `
${dash}`,

	'SA': ` ${dash}`,

	'': `
|PRESS SPACE TO CONTINUE|`,

	'TRIP': `
|PRESS SPACE TO KEEP GOING|`,

	'PURCHASE': `
You have $_Money.
Buy an item: ${dash}
|PRESS SPACE TO EXIT|`

}

const v = {
	Version: '2022.05.30.2',
	Money: 1600,
	Items: {}
}

const fontSize = 18
const fontWidth = 17
const fontHeight = 18
const lineHeight = 35


let id, prompt, background, foreground, type, music, variable, space, short,
	choices

let counter = 0

const format = string => string
	.replaceAll('<I>', '|            |')
	.replaceAll(/_(\w+)/g, (_, key) => v[key])
	.replaceAll(/(?![^\n]{1,57}$)([^\n]{1,57})\s/g, '$1\n')

let w = 1000
let h = 800

const text = {
	canvas: document.createElement('canvas'),
	content: ''
}
const image = {
	canvas: document.createElement('canvas'),
	foreground: new Image(),
	background: new Image(),
}
const combined = {
	canvas: document.createElement('canvas')
}
const input = {
	element: document.querySelector('textarea'),
	x: w,
	y: h
}
input.element.addEventListener('blur', input.element.focus)

const glCanvas = fx.canvas()

async function initCanvas() {
	([text, image, combined]).forEach(x => {
		x.canvas.width = w
		x.canvas.height = h
		x.ctx = x.canvas.getContext('2d')
	})
	combined.texture = glCanvas.texture(combined.canvas)
	combined.ctx.translate(w / 10, h / 10)
	combined.ctx.scale(4 / 5, 4 / 5)

	text.ctx.textBaseline = 'top'
	text.ctx.font = `${fontSize}px pressstart`
	text.ctx.strokeStyle = 'black'
	text.ctx.lineWidth = 2
	text.ctx.shadowColor = 'black'
	text.ctx.shadowOffsetX = 4
	text.ctx.shadowOffsetY = 4

	text.ctx.fillStyle = 'white'

	image.ctx.imageSmoothingEnabled = false
	document.body.prepend(glCanvas)
}

async function show(_id) {
	id = _id
	input.x = input.y = 0
	image.ctx.clearRect(0, 0, w, h)
	image.ctx.fillStyle = '#000'
	image.ctx.fillRect(0, 0, w, h);
	[prompt, background, foreground, music, variable, type, space, short,
		...choices
	] =
	data[id]
	//console.log(id, data[id], choices)
	image.background.src = `media/${background}.png`
	image.foreground.src = `media/${foreground}.png`
	if (music) {
		audio.pause()
		audio = new Audio(`media/${music}.mp3`)
		audio.play()
	}
	prompt += endings[type]
	write(prompt)
}

async function drawBackground() {
	image.ctx.drawImage(image.background, 0, 0, w, h)
	render()
}
async function drawForeground() {
	image.ctx.drawImage(image.foreground, 0, 0, w, h)
	render()
}
async function main() {
	data = (
		Object.fromEntries(
			Papa.parse(
				await (await fetch('story.csv')).text()
			).data
			.map(([id, ...rest]) => [id, rest]))
	)

	input.element.addEventListener('keydown', enterListener)
	input.element.addEventListener('input', inputListener)
	document.addEventListener('click', clickListener)

	image.background.addEventListener('load', drawBackground)
	image.foreground.addEventListener('load', () => {
		setTimeout(drawForeground, 100)
		setTimeout(drawBackground, 200)
		setTimeout(drawForeground, 300)
		setTimeout(drawBackground, 400)
		setTimeout(drawForeground, 500)
	})

	const fontFace = new FontFace('pressstart', 'url(media/pressstart.ttf)')
	const font = await fontFace.load()
	document.fonts.add(font)

	await initCanvas()
	show('Begin')
}
main()

async function clickListener() {
	inputListener({
		key: ' '
	})
}
async function enterListener({
	key
}) {
	//text.ctx.clearRect(input.x, input.y, fontWidth * 16, fontHeight)


	if (key == 'Enter') {

		if (variable) v[variable] = input.element.value

		if (short) {
			show(short)
		} else {
			const num = parseInt(input.element.value) - 1
			if (choices[num]) {
				if (type == 'PURCHASE') {
					if (v.Money >= choices[num]) {
						v.Money -= choices[num]
						write(("YOU BOUGHT ONE ITEM.\n" + prompt))
					} else {
						write(("YOU DON'T HAVE THE MONEY FOR THAT. PICK ANOTHER OR LEAVE MY STORE.\n" +
							prompt))
					}
				} else {
					show(choices[num])
				}
			} else {
				write('INVALID OPTION. PICK ANOTHER.\n' + prompt)
			}
		}
		//if(item in v.items) variables.items[item]++
		//else v.items[item] = 0
	}

}

async function inputListener({
	data
}) {
	if (data == ' ' && space) show(space)
	if (!input.x && !input.y) return;
	text.ctx.clearRect(input.x, input.y, fontWidth * 16, fontHeight)
	write(input.element.value, input.x, input.y, false)
}

async function write(content, x = 20, y = 790, auto = true) {
	let style = {
		italic: false,
		bold: false,
		underline: false,
		strikethrough: false,
	}
	let string = format(content)

	if (auto) {
		counter++
		y -= string.split('\n').length * lineHeight
		clearInput()
		input.x = input.y = 0
		text.ctx.clearRect(0, 0, w, h)
	}

	let _counter = counter;
	for (let i = 0; i < string.length; i++) {
		setTimeout(() => {
			if (_counter != counter) return
			let char = string[i]
			switch (char) {
				case '\n':
					x = 20
					y += lineHeight
					break
				case '~':
					style.strikethrough ^= 1
					break
				case '|':
					style.underline ^= 1
					break
				case '*':
					style.italic ^= 1
					break
				case '\t':
					let span = 2 * fontWidth
					if (!input.x && !input.y) {
						clearInput()
						input.x = x
						input.y = y
					}
					text.ctx.fillStyle = 'black'
					text.ctx.fillRect(x + 4, y + 4 + fontHeight,
						span, 3)
					text.ctx.fillStyle = 'white'
					text.ctx.fillRect(x, y + fontHeight, span, 3)
					x += span
					break
				default:
					text.ctx.strokeText(char, x, y)
					text.ctx.fillText(char, x, y)
					if (style.strikethrough)
						text.ctx.fillRect(x, y + fontHeight / 3,
							fontWidth, 3)
					if (style.underline)
						text.ctx.fillRect(x, y + fontHeight,
							fontWidth, 3)
					x += fontWidth
			}
			if(!auto || i%2 || i == string.length - 1) render()
		}, i * 15 * auto)
	}

}

async function render() {
	combined.ctx.drawImage(image.canvas, 0, 0, w, h)
	combined.ctx.drawImage(text.canvas, 0, 0, w, h)
	combined.texture.loadContentsOf(combined.canvas)

	// Apply WebGL magic
	glCanvas.draw(combined.texture).bulgePinch(w / 2, h / 2, w * 3 / 4,
			0.2)
		.vignette(0.25, 0.7)
		//.brightnessContrast(0.1, 0.1)
		.update()
}
async function clearInput() {
	input.element.value = ''
}
