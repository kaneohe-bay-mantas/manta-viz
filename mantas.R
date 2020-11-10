library(dplyr)
library(lubridate)
library(plotrix)
library(jpeg)
library(OSMscale)
library(leaflet)
library(leaflet.extras)
library(leaflet.opacity)

# publish as CSV and copy link
mantas = read.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vRcD376mqZL3SUTWe5ksWD4_FgNW4yNLpV0X3NAyGhvYE3-nbnsEVh5gaXDUPjdH7k4uWiNvR5zUBci/pub?gid=0&single=true&output=csv", stringsAsFactors = F)

#mantas = mantas[-c(8), ]
mantas = filter(mantas, mantas$Group.Size > 0)
mantas = filter(mantas, Toby. == T)

height = function(time, pre_time, pre_height, post_time, post_height) {
  midpoint = (pre_time + post_time) / 2
  amplitude = abs(pre_height - post_height) / 2
  return(ifelse(pre_height > post_height, -1, 1) * amplitude * sin((time - midpoint) * (2 * pi) / (2 * (post_time - pre_time))) + (pre_height + post_height) / 2)
}

slope = function(time, pre_time, pre_height, post_time, post_height) {
  midpoint = (pre_time + post_time) / 2
  amplitude = abs(pre_height - post_height) / 2
  return(ifelse(pre_height > post_height, -1, 1) * amplitude * cos((time - midpoint) * (2 * pi) / (2 * (post_time - pre_time))) * (2 * pi) / (2 * (post_time - pre_time)))
}

mantas$ymdt = paste0(mantas$Yr, mantas$Mo, mantas$Da, mantas$Time)
mantas$height = height(mantas$Time, mantas$Pre.Time, mantas$Pre.Height, mantas$Post.Time, mantas$Post.Height)
mantas$slope = slope(mantas$Time, mantas$Pre.Time, mantas$Pre.Height, mantas$Post.Time, mantas$Post.Height)
mantas$tidal_change = abs(mantas$Pre.Height - mantas$Post.Height)
mantas$decimal_date = decimal_date(as.Date(paste0(mantas$Yr, "-", mantas$Mo, "-", mantas$Da)))
mantas$decimal_date = mantas$decimal_date - floor(mantas$decimal_date)
mantas$rising = mantas$Pre.Height < mantas$Post.Height
mantas$tidal_phase = ifelse(mantas$rising, pi, 0) + (mantas$Time - mantas$Pre.Time) / (mantas$Post.Time - mantas$Pre.Time) * pi
mantas$moon_phase = as.numeric(as.Date(paste0(mantas$Yr, "-", mantas$Mo, "-", mantas$Da)) - as.Date(paste0(mantas$Full.Yr, "-", mantas$Full.Mo, "-", mantas$Full.Da))) / 28 * 2 * pi
mantas$lat = degree(mantas$Latitude, mantas$Longitude)$lat
mantas$long = -1 * degree(mantas$Latitude, mantas$Longitude)$long

total_mantas = summarize(group_by(mantas, ymdt), Mantas = sum(Group.Size))
#total_mantas = summarize(group_by(mantas, ymdt), Mantas = max(Group.Size))
total_mantas = left_join(total_mantas, mantas, by = "ymdt")
total_mantas = distinct(total_mantas, ymdt, .keep_all= TRUE)

mantas_plot = total_mantas

par(mfrow = c(1, 1))

# Tidal Height
par(xpd = T, mar = c(4, 4, 1, 1), las = 1)
plot(mantas_plot$height, mantas_plot$Mantas, ylim = c(0, max(mantas_plot$Mantas)), xlab = "Tidal Height (ft)", ylab = "# of Mantas", xaxs = "i", yaxs = "i", axes = F, pch = 16)
axis(side = 1)
lines(c(min(mantas_plot$height), max(mantas_plot$height)), c(0, 0))
axis(side = 2)
lines(c(min(mantas_plot$height), min(mantas_plot$height)), c(0, max(mantas_plot$Mantas)))
# smoother
l = loess(mantas_plot$Mantas ~ mantas_plot$height, span = 1.5)
x = seq(min(mantas_plot$height), max(mantas_plot$height), length.out = 100)
y = predict(l, x)
lines(x, y)

# Tidal Rate
par(xpd = T, mar = c(4, 4, 1, 1), las = 1)
plot(mantas_plot$slope, mantas_plot$Mantas, ylim = c(0, max(mantas_plot$Mantas)), xlab = "Tidal Change (ft/hr)", ylab = "# of Mantas", xaxs = "i", yaxs = "i", axes = F, pch = 16)
axis(side = 1)
lines(c(min(mantas_plot$slope), max(mantas_plot$slope)), c(0, 0))
axis(side = 2)
lines(c(min(mantas_plot$slope), min(mantas_plot$slope)), c(0, max(mantas_plot$Mantas)))
# smoother
l = loess(mantas_plot$Mantas ~ mantas_plot$slope, span = 1.5)
x = seq(min(mantas_plot$slope), max(mantas_plot$slope), length.out = 100)
y = predict(l, x)
lines(x, y)

# Within-Year
par(xpd = T, mar = c(4, 4, 1, 1), las = 1)
plot(mantas_plot$decimal_date, mantas_plot$Mantas, xlim = c(0, 1), ylim = c(0, max(mantas_plot$Mantas)), xlab = "Month", ylab = "# of Mantas", xaxs = "i", yaxs = "i", axes = F, pch = 16)
axis(side = 1, at = c(0, 3, 6, 9) / 11, labels = c("Jan", "Apr", "Jul", "Oct"))
lines(c(0, 1), c(0, 0))
axis(side = 2)
lines(c(0, 0), c(0, max(mantas_plot$Mantas)))
# smoother
mantas2 = mantas_plot
mantas2$decimal_date = mantas2$decimal_date - 1
mantas3 = mantas_plot
mantas3$decimal_date = mantas3$decimal_date + 1
mantas4 = mantas_plot
mantas4$decimal_date = mantas4$decimal_date - 2
mantas5 = mantas_plot
mantas5$decimal_date = mantas5$decimal_date + 2
expanded_mantas = rbind(mantas_plot, mantas2, mantas3, mantas4, mantas5)
l = loess(expanded_mantas$Mantas ~ expanded_mantas$decimal_date, span = 0.25)
x = seq(0, 1, length.out = 100)
y = predict(l, x)
lines(x, y)

# Fancy Tidal Phase: 0 = high, pi = low, 2 * pi = high
par(xpd = T, mar = c(1, 4, 3, 4), las = 1)
plot(NULL, xlim = c(-1, 1), ylim = c(-1, 1), xaxs = "i", yaxs = "i", axes = F, ann = F, asp = 1)
# x-axis
lines(c(-1, 1), c(0, 0), col = "gray")
text(0.5, 1.25, "Falling", adj = c(0.5, 0.5))
text(0, 1.25, "Slack", adj = c(0.5, 0.5))
text(-0.5, 1.25, "Rising", adj = c(0.5, 0.5))
arrows(0.15, 1.25, 0.35, 1.25, length = 0.1)
arrows(-0.15, 1.25, -0.35, 1.25, length = 0.1)
# y-axis
lines(c(0, 0), c(-1, 1), col = "gray")
text(-1.3, 0.5, "High", adj = c(0, 0.5))
text(-1.3, 0, "Mid", adj = c(0, 0.5))
text(-1.3, -0.5, "Low", adj = c(0, 0.5))
arrows(-1.24, 0.1, -1.24, 0.4, length = 0.1)
arrows(-1.24, -0.1, -1.24, -0.4, length = 0.1)
# circles
circle_locations = NULL
circle_labels = NULL
if(max(mantas_plot$Mantas) < 10) {
  circle_locations = 0.2 + 0.8 * 0:max(mantas_plot$Mantas) / max(mantas_plot$Mantas)
  circle_labels = 0:max(mantas_plot$Mantas)
} else {
  m = 2 * (0:ceiling(max(mantas_plot$Mantas) / 2))
  circle_locations = 0.2 + 0.8 * m / max(m)
  circle_labels = 2 * (0:ceiling(max(mantas_plot$Mantas) / 2))
}
draw.circle(0, 0, radius = circle_locations, border = "gray")
points(c(0, 1, 0, -1), c(1, 0, -1, 0), pch = 18, col = c("red", "orange", "green", "blue"), cex = 1.5)
text(x = circle_locations, y = 0, labels = circle_labels, adj = c(1, 0), cex = 0.8)
text(x = c(1.2, 1.2), y = c(0.08, 0), labels = c("# of", "Mantas"), cex = 0.8)
# data
theta = mantas_plot$tidal_phase
r = 0.2 + 0.8 * mantas_plot$Mantas / max(mantas_plot$Mantas)
y = r * cos(theta)
x = r * sin(theta)
points(x, y, pch = 16, col = "black")
# smoother
mantas2 = mantas_plot
mantas2$tidal_phase = mantas2$tidal_phase - 2 * pi
mantas3 = mantas_plot
mantas3$tidal_phase = mantas3$tidal_phase + 2 * pi
expanded_mantas = rbind(mantas_plot, mantas2, mantas3)
l = loess(expanded_mantas$Mantas ~ expanded_mantas$tidal_phase, span = 0.18)
theta = seq(0, 2 * pi, length.out = 100)
force_smooth = 6
r = 0.2 + 0.8 * predict(l, theta[theta < force_smooth]) / max(mantas_plot$Mantas)
r[theta >= force_smooth] = r[length(r)] + (r[1] - r[length(r)]) / (2 *  pi - force_smooth) * (theta[theta >= force_smooth] - force_smooth)
y = r * cos(theta)
x = r * sin(theta)
lines(x, y)
# mini-plot
xleft = -1.1
ybottom = 0.8
xright = -0.7
ytop = 1.1
rect(xleft, ybottom, xright, ytop, border = "gray")
x = seq(xleft, xright, length.out = 100)
y = (ybottom + ytop) / 2 + (ytop - ybottom) / 2 * cos((x - xleft) * 2 * pi / (xright - xleft))
lines(x, y)
points(seq(xleft, xright, length.out = 5), c(ytop, (ybottom + ytop) / 2, ybottom, (ybottom + ytop) / 2, ytop), pch = 18, col = c("red", "orange", "green", "blue", "red"))
par(xpd = F)

# Fancy Moon Phase: 0 = Full, pi = New, 2 * pi = Full
par(xpd = T, mar = c(4, 4, 4, 4), las = 1)
plot(NULL, xlim = c(-1, 1), ylim = c(-1, 1), xaxs = "i", yaxs = "i", axes = F, ann = F, asp = 1)
# x-axis
lines(c(-1, 1), c(0, 0), col = "gray")
# y-axis
lines(c(0, 0), c(-1, 1), col = "gray")
# circles
circle_locations = NULL
circle_labels = NULL
if(max(mantas_plot$Mantas) < 10) {
  circle_locations = 0.2 + 0.8 * 0:max(mantas_plot$Mantas) / max(mantas_plot$Mantas)
  circle_labels = 0:max(mantas_plot$Mantas)
} else {
  m = 2 * (0:ceiling(max(mantas_plot$Mantas) / 2))
  circle_locations = 0.2 + 0.8 * m / max(m)
  circle_labels = 2 * (0:ceiling(max(mantas_plot$Mantas) / 2))
}
draw.circle(0, 0, radius = circle_locations, border = "gray")
text(x = circle_locations, y = 0, labels = circle_labels, adj = c(1, 0), cex = 0.8)
text(x = c(1.17, 1.17), y = c(0.26, 0.18), labels = c("# of", "Mantas"), cex = 0.8)
# data
theta = mantas_plot$moon_phase
r = 0.2 + 0.8 * mantas_plot$Mantas / max(mantas_plot$Mantas)
y = r * cos(theta)
x = r * sin(theta)
points(x, y, pch = 16, col = "black")
# smoother
mantas2 = mantas_plot
mantas2$moon_phase = mantas2$moon_phase - 2 * pi
mantas3 = mantas_plot
mantas3$moon_phase = mantas3$moon_phase + 2 * pi
expanded_mantas = rbind(mantas_plot, mantas2, mantas3)
l = loess(expanded_mantas$Mantas ~ expanded_mantas$moon_phase, span = 0.18)
theta = seq(0, 2 * pi, length.out = 100)
force_smooth = 6
r = 0.2 + 0.8 * predict(l, theta[theta < force_smooth]) / max(mantas_plot$Mantas)
r[theta >= force_smooth] = r[length(r)] + (r[1] - r[length(r)]) / (2 *  pi - force_smooth) * (theta[theta >= force_smooth] - force_smooth)
y = r * cos(theta)
x = r * sin(theta)
lines(x, y)
# moons
moon1 = readJPEG("/Users/Toby/Documents/GitHub/mantas/1.jpg")
moon2 = readJPEG("/Users/Toby/Documents/GitHub/mantas/2.jpg")
moon3 = readJPEG("/Users/Toby/Documents/GitHub/mantas/3.jpg")
moon4 = readJPEG("/Users/Toby/Documents/GitHub/mantas/4.jpg")
rasterImage(moon1, -0.125, 1.05, 0.125, 1.3)
rasterImage(moon2, 1.05, -0.125, 1.3, 0.125)
rasterImage(moon3, -0.125, -1.05, 0.125, -1.3)
rasterImage(moon4, -1.05, -0.125, -1.3, 0.125)
par(xpd = F)

# map
mantas_separated = data.frame()
for(i in 1:nrow(mantas)) {
  for(j in 1:mantas[i,]$Group.Size) {
    r = mantas[i,]
    r$Group.Size = 1
    mantas_separated = rbind(mantas_separated, r)
  }
}

map = "Esri.WorldImagery"
mantas_map = filter(mantas_separated, !is.na(mantas_separated$lat))
mantas_map = mantas_map[, !(names(mantas_map) %in% c("Latitude", "Longitude"))]
leaflet(data = mantas_map) %>% addProviderTiles(map) %>% addHeatmap(~long, ~lat, intensity = ~Group.Size, layerId = "heatmap", radius = 40, blur = 65) %>% addOpacitySlider(layerId = "heatmap")

#*************************************************

# publish as CSV and copy link
ids = read.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vRcD376mqZL3SUTWe5ksWD4_FgNW4yNLpV0X3NAyGhvYE3-nbnsEVh5gaXDUPjdH7k4uWiNvR5zUBci/pub?gid=288807234&single=true&output=csv", stringsAsFactors = F)
ids$total.mantas = sapply(1:nrow(ids), function(z) sum(ids$New.Manta[1:z]))

mod = nls(total.mantas ~ a * (1 - exp(b * Overall.Sighting)), data = ids, start = list(a = 50, b = -0.01))
summary(mod)
asymptote = coef(mod)[1]

x_max = 1 + sum(predict(mod, list(Overall.Sighting = 0:(2 * max(ids$Overall.Sighting)))) / asymptote <= 0.9)
y_max = 1.1 * asymptote

par(xpd = T, mar = c(4, 4, 1, 1), las = 1)
plot(x = ids$Overall.Sighting, y = ids$total.mantas, xlim = c(0, x_max), ylim = c(0, y_max), xlab = "# of Manta Sightings", ylab = "# of Unique Mantas", xaxs = "i", yaxs = "i", axes = F, pch = 16)
axis(side = 1)
lines(c(0, x_max), c(0, 0))
axis(side = 2)
lines(c(0, 0), c(0, y_max))

lines(x = 0:x_max, y = predict(mod, list(Overall.Sighting = 0:x_max)))
lines(x = c(0, x_max), y = c(asymptote, asymptote), lty = 2)
text(x = x_max, y = 1.02 * asymptote, labels = paste0("Population Estimate = ", round(asymptote, 1), " mantas"), adj = c(1, 0))
