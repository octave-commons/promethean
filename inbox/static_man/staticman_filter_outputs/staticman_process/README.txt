Static Man – quick filter outputs (demo)

Source image was cropped to remove title/labels, then split into 4 equal orthographic views (front/back/left/right).

Files per view:
- *_sharp.png   : denoise + CLAHE + unsharp (good for edge finding)
- *_thr.png     : adaptive threshold (noisy; shown for reference)
- *_edges.png   : Canny edges from *_sharp
- *_otsu.png    : heavy median blur + Otsu threshold (a rough silhouette seed)
- *_otsu_center.png : center-selected connected component from *_otsu (still rough)

These are not “the final answer”, just a starting point to tune parameters.
