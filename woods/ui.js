outlets = 3;
sketch.default2d();

var backColor = [0.357, 0.357, 0.357, 1.000];
var treeColor = [0.769, 0.875, 0.890, 1.000];
var activeColor = [0.769, 0.875, 0.890, 0.2];
var holdColor = [0.702, 0.412, 0.412, 0.5];
var mcoord = [0., 0., 0.];
var hovered = -1;

var forest = [];
var maxNumber = 256;

initForest();
draw();

function initForest()
{
	for(var i = 0; i < maxNumber; i++) {
		forest[i] = {
			coord: [0., 0.],
			size: 0.025,
			isHovered: false,
			isGrabbed: false,
			isVisible: i == 0,
			isActive: false,
			text: "",
			isHold: false
		}
	}
}

function draw()
{
	with(sketch) {
		glclearcolor(backColor[0], backColor[1], backColor[2], backColor[3]);
		glclear();
		
		for(var i = 1; i <= maxNumber; i++) {
			i = i % maxNumber;
			if(!forest[i].isVisible)
				continue;
			
			moveto(forest[i].coord[0], forest[i].coord[1]);
			
			if(forest[i].isHold) {
				glcolor(holdColor);
				gllinewidth(2);
				for(var j = 1; j < 4; j++)
					framecircle(forest[i].size + (j * 0.004));
			}
			
			glcolor(treeColor);	
		
			if(forest[i].isHovered) {
				gllinewidth(2);
				fontsize(9);
			}
			else {
				gllinewidth(1);
				fontsize(8);
			}
			
			framecircle(forest[i].size);
			
			textalign("center", "center");
			if(i > 0)
				text(i.toString() + "." + forest[i].text);
			
			glcolor(activeColor);
			moveto(forest[i].coord[0], forest[i].coord[1]);
			if(forest[i].isActive)
				circle(forest[i].size);
			
			if(i == 0)
				break;
		}
	}
	refresh();
}

function forceSize(w, h)
{
	if(w != h) {
		h = w;
		box.size(w, h);
	}
}

function onresize(w, h)
{
	forceSize(w, h);
	draw();
}

function move(x, y)
{
	if((x > box.rect[0]) && (x < box.rect[2]) && (y > box.rect[1]) && (y < box.rect[3])) {
		x = x - box.rect[0];
		y = y - box.rect[1];
		mcoord = sketch.screentoworld(x, y);
		
		var isg = false;
		for(var i = 0; i < maxNumber; i++) {
			if(!forest[i].isVisible)
				continue;
				
			if(forest[i].isGrabbed) {
				forest[i].coord = mcoord;
				isg = true;
				break;
			}
		}
		
		if(!isg) {
			var hind = -1;
			var hsize = 5;
			
			for(var i = 0; i < maxNumber; i++) {
				if(!forest[i].isVisible)
					continue;
				
				if(isHover(mcoord, forest[i].coord, forest[i].size)[0]) {
					if(forest[i].size < hsize) {
						hsize = forest[i].size;
						hind = i;
					}	
				}
				forest[i].isHovered = false;
			}
			if(hind != -1) {
				forest[hind].isHovered = true;
			}
			
			if(hind != hovered) {
				hovered = hind;
				outlet(1, hovered);
			}
		}
		
		calcActive();
		
		draw();
	}
}

function calcActive()
{
	for(var i = 1; i < maxNumber; i++) {
		if(!forest[i].isVisible)
			continue;
			
		var old = forest[i].isActive;
		var h = isHover(forest[0].coord, forest[i].coord, forest[i].size);
		forest[i].isActive = h[0];
			
		if(old != forest[i].isActive)
			outlet(0, i, "act", !old);
				
		if(forest[i].isActive) {
			var fx = forest[0].coord[0];
			var fy = forest[0].coord[1];
			var x = (fx - forest[i].coord[0]) / forest[i].size;
			var y = (fy - forest[i].coord[1]) / forest[i].size;
			
			outlet(0, i, "dist", h[1]);
			outlet(0, i, "x", x);
			outlet(0, i, "y", y);
			
			if(fx != 0) {
				outlet(0, i, "angle", Math.abs(Math.atan(y / x)) / (Math.PI / 2.));
			}
		}
	}
}

function onclick(x,y,but,cmd,shift,capslock,option,ctrl)
{
	forest[0].coord = sketch.screentoworld(x, y);
	move(x + box.rect[0], y + box.rect[1]);
}

function grab()
{
	for(var i = 0; i < maxNumber; i++) {
		if(forest[i].isHovered)
			forest[i].isGrabbed = !forest[i].isGrabbed;
	}
}

function isHover(mc, c, s)
{
	var d = Math.sqrt(Math.pow(mc[0] - c[0], 2) + Math.pow(mc[1] - c[1], 2));
	return [d <= s, d / s];
}

function add(i, n)
{
	if((i > 0) && (i < maxNumber)) {
		if(!forest[i].isVisible) {
			forest[i].isVisible = true;
			forest[i].size = 0.15;
			forest[i].text = n;
			forest[i].isHold = false;
			draw();
		}
	}
}

function del(i, n)
{
	if((i > 0) && (i < maxNumber)) {
		forest[i].isVisible = false;
		draw();
	}
}

function inc()
{
	for(var i = 1; i < maxNumber; i++) {
		if(forest[i].isHovered) {
			forest[i].size += 0.05;
			if(forest[i].size > 0.8)
				forest[i].size = 0.8;
			break;
		}
	}
	draw();
}

function dec()
{
	for(var i = 1; i < maxNumber; i++) {
		if(forest[i].isHovered) {
			forest[i].size -= 0.05;
			if(forest[i].size < 0.1)
				forest[i].size = 0.1;
			break;
		}
	}
	draw();
}

function clear()
{
	for(var i = 1; i < maxNumber; i++) {
		forest[i].isVisible = false;
		forest[i].isActive = false;
		forest[i].coord = [0., 0.];
		forest[i].isHold = false;
	}
	draw();
}

function hold()
{
	for(var i = 1; i < maxNumber; i++) {
		if(forest[i].isHovered) {
			forest[i].isHold = !forest[i].isHold;
			outlet(0, i, "hold", forest[i].isHold);
			calcActive();
			draw();
			break;
		}
	}
}

function ssave()
{
	dict = new Dict("save");
	dict.remove("ui");
	
	for(var i = 1; i < maxNumber; i++) {
		if(forest[i].isVisible) {
			dict.replace("ui::" + i + "::coord", forest[i].coord);
			dict.replace("ui::" + i + "::size", forest[i].size);
			dict.replace("ui::" + i + "::hold", forest[i].isHold);
			dict.replace("ui::" + i + "::text", forest[i].text);
		}
	}
}

function sload()
{
	initForest();
	outlet(2, "clear");
	
	dict = new Dict("save");
	for(var i = 1; i < maxNumber; i++) {
		s = "ui::" + i;
		if(dict.contains(s)) {
			forest[i].isVisible = true;
			forest[i].coord = dict.get(s + "::coord");
			forest[i].size = dict.get(s + "::size");
			forest[i].isHold = dict.get(s + "::hold");
			forest[i].text = dict.get(s + "::text");
			outlet(2, "add", i, forest[i].text);
		}
	}
	draw();
	outlet(2, "done");
}