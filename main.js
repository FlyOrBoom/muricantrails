const data =
	Object.fromEntries(
		Papa.parse(
			document.querySelector('div').innerHTML
		).data
			.map(([id, ...rest]) => [id, rest]))

const endings = {
	'MC': '\n<I>',
	'SA': ' <I>',
	'': '\n|PRESS SPACE TO CONTINUE|',
	'PURCHASE': '\nYou have $_Money.\nBuy an item: <I>\n|PRESS SPACE TO EXIT|'
}

const v = {
	Version: '2022.05.26.1',
	Money: 1600,
	Items: {}
}

const fontSize = 18
const fontWidth = 17
const fontHeight = 18

const input = document.querySelector('input')
input.addEventListener('blur', input.focus)

let id, prompt, type, music, variable, choices

let counter = 0

const format = string => string
	.replaceAll('\n', '\n\n')
	.replaceAll('<I>', '|            |')
	.replaceAll(/_(\w+)/g, (_, key) => v[key])
	.replaceAll(/(?![^\n]{1,57}$)([^\n]{1,57})\s/g, '$1\n')

let w = 1000
let h = 800

const text = { canvas: document.createElement('canvas'), content: '' }
const image = { canvas: document.createElement('canvas'), content: new Image() }
const combined = { canvas: document.createElement('canvas') }
const glCanvas = fx.canvas()

async function initCanvas() {
	([text, image, combined]).forEach(x => {
		x.canvas.width = w
		x.canvas.height = h
		x.ctx = x.canvas.getContext('2d')
	})
	combined.texture = glCanvas.texture(combined.canvas)
	combined.ctx.translate(w / 8, h / 8)
	combined.ctx.scale(3 / 4, 3 / 4)
	text.ctx.textBaseline = 'top'
	document.body.prepend(glCanvas)
}

async function show(_id) {
	id = _id;
	input.value = ''
	image.ctx.clearRect(0, 0, w, h)
	image.ctx.fillStyle = '#000'
	image.ctx.fillRect(0, 0, w, h);
	[prompt, type, music, variable, ...choices] = data[id]
	console.log(id, data[id], choices)
	image.content.src = `media/${id}.png`
	image.content.addEventListener('load', () => {
		image.ctx.drawImage(image.content, 0, 0, w, h)
		setTimeout(render, 10)
	})
	prompt += endings[type]
	write(prompt)
}

async function main() {
	document.addEventListener('keydown', enterListener)
	document.addEventListener('click', clickListener)

	const fontFace = new FontFace('pressstart', 'url(media/pressstart.ttf)');
	const font = await fontFace.load()
	document.fonts.add(font)

	await initCanvas()
	show('Begin')
}
main()

async function clickListener() {
	switch (type) {
		case '':
			show(choices[0])
			break
		case 'PURCHASE':
			show(choices[0])
			break
	}
}

async function enterListener({ key }) {
	if (key == ' ') {
		switch (type) {
			case 'PURCHASE':
			case '':
				clickListener()
				return
		}
	}

	if (key != 'Enter') return

	if (variable) v[variable] = input.value
	const num = parseInt(input.value)
	switch (type) {
		case 'MC':
			if (choices[num]) {
				show(choices[num])
			} else {
				write('INVALID OPTION. PICK ANOTHER.\n' + prompt)
			}
			break
		case 'SA':
			show(choices[0])
			break
		case 'PURCHASE':
			if (v.Money >= choices[num]) {
				v.Money -= choices[num]
				write(("YOU BOUGHT ONE ITEM.\n" + prompt))
			} else {
				write(("YOU DON'T HAVE THE MONEY FOR THAT. PICK ANOTHER OR LEAVE MY STORE.\n" + prompt))
			}


		//if(item in v.items) variables.items[item]++
		//else v.items[item] = 0
	}
}

async function write(content) {
	input.value = ''
	counter++;
	let x = 0
	let y = 20
	text.content = format(content)
	let style = {
		italic: false,
		bold: false,
		underline: false,
		strikethrough: false,
	}
	let _counter = counter
	text.ctx.clearRect(0,0,w,h)
	for (let i = 0; i < text.content.length; i++) {
		setTimeout(() => {
			if (_counter != counter) return
			let char = text.content[i]
			switch (char) {
				case '\n':
					x = 0
					y += 30
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
				default:
					x += fontWidth

					text.ctx.font = `${fontSize}px pressstart ${'bold'.repeat(style.bold)}`

					text.ctx.fillStyle = 'black'
					text.ctx.strokeStyle = 'black'
					text.ctx.lineWidth = 2
					text.ctx.fillText(char, x + 4, y + 4)
					text.ctx.strokeText(char, x, y)
					if (style.strikethrough) text.ctx.fillRect(x + 4, y + 4 + fontHeight / 2, fontWidth, 3)
					if (style.underline) text.ctx.fillRect(x + 4, y + 4 + fontHeight, fontWidth, 3)

					text.ctx.fillStyle = 'white'
					text.ctx.fillText(char, x, y)
					if (style.strikethrough) text.ctx.fillRect(x, y + fontHeight / 2, fontWidth, 3)
					if (style.underline) text.ctx.fillRect(x, y + fontHeight, fontWidth, 3)

					render()
			}
		}, i * 20)
	}

}

async function render() {
	combined.ctx.drawImage(image.canvas,0,0,w,h)
	combined.ctx.drawImage(text.canvas,0,0,w,h)
	combined.texture.loadContentsOf(combined.canvas)

	// Apply WebGL magic
	glCanvas.draw(combined.texture).bulgePinch(w / 2, h / 2, w * 3 / 4, 0.25)
		.vignette(0.25, 0.74)
		//.lensBlur(0.2,1,0)
		.brightnessContrast(0.1, 0.1)
		.update()
}
