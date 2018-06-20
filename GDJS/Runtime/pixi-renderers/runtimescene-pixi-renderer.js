gdjs.RuntimeScenePixiRenderer = function(runtimeScene, runtimeGameRenderer) {
  this._pixiRenderer = runtimeGameRenderer
    ? runtimeGameRenderer.getPIXIRenderer()
    : null;
  this._runtimeScene = runtimeScene;
  this._pixiContainer = new PIXI.Container(); //The Container meant to contains all pixi objects of the scene.
};

gdjs.RuntimeSceneRenderer = gdjs.RuntimeScenePixiRenderer; //Register the class to let the engine use it.

gdjs.RuntimeScenePixiRenderer.prototype.onCanvasResized = function() {
  if (!this._pixiRenderer) return;

  var runtimeGame = this._runtimeScene.getGame();
  this._pixiContainer.scale.x =
    this._pixiRenderer.width / runtimeGame.getDefaultWidth();
  this._pixiContainer.scale.y =
    this._pixiRenderer.height / runtimeGame.getDefaultHeight();
};

gdjs.RuntimeScenePixiRenderer.prototype.render = function() {
  if (!this._pixiRenderer) return;

  this._renderProfileText(); //Uncomment to display profiling times

  // render the PIXI container of the scene
  this._pixiRenderer.backgroundColor = this._runtimeScene.getBackgroundColor();
  this._pixiRenderer.render(this._pixiContainer);
};

gdjs.RuntimeScenePixiRenderer._getProfilerSectionTexts = function(
  sectionName,
  profilerSection,
  outputs
) {
  var percent =
    profilerSection.parent && profilerSection.parent.time !== 0
      ? ((profilerSection.time / profilerSection.parent.time) * 100).toFixed(1)
      : "100%";
  var time = profilerSection.time.toFixed(2);
  outputs.push(
    sectionName + ": " + time + "ms (" + percent + ")"
  );
  var subsectionsOutputs = [];

  for (var subsectionName in profilerSection.subsections) {
    if (profilerSection.subsections.hasOwnProperty(subsectionName)) {
      gdjs.RuntimeScenePixiRenderer._getProfilerSectionTexts(
        subsectionName,
        profilerSection.subsections[subsectionName],
        subsectionsOutputs
      );
    }
  }
  outputs.push.apply(outputs, subsectionsOutputs);
};

gdjs.RuntimeScenePixiRenderer.prototype._renderProfileText = function() {
  if (!this._profilerText) {
    this._profilerText = new PIXI.Text(" ", {
      align: "left",
      stroke: "#FFF",
      strokeThickness: 1
    });
    this._pixiContainer.addChild(this._profilerText);
  }

  var average = this._runtimeScene._profiler.getFramesAverageMeasures();
  var outputs = [];
  gdjs.RuntimeScenePixiRenderer._getProfilerSectionTexts("All", average, outputs);

  this._profilerText.text = outputs.join("\n");
};

gdjs.RuntimeScenePixiRenderer.prototype.hideCursor = function() {
  this._pixiRenderer.view.style.cursor = "none";
};

gdjs.RuntimeScenePixiRenderer.prototype.showCursor = function() {
  this._pixiRenderer.view.style.cursor = "";
};

gdjs.RuntimeScenePixiRenderer.prototype.getPIXIContainer = function() {
  return this._pixiContainer;
};
