from flask import Flask, request, jsonify
from flask_cors import CORS
from scipy.spatial import ConvexHull
import numpy as np

app = Flask(__name__)
CORS(app)

def compute_hull(points):
    pts = np.array(points)
    pts = np.unique(pts, axis=0)

    if np.linalg.matrix_rank(pts - pts[0]) < 3:
        return None

    try:
        hull = ConvexHull(pts)
    except Exception as e:
        print("ConvexHull failed:", e)
        return None

    return {
        "vertices": pts.tolist(),
        "simplices": hull.simplices.tolist()
    }

@app.route("/hull", methods=["POST"])
def hull():
    data = request.json
    points = data["points"]

    return jsonify(compute_hull(points))

if __name__ == "__main__":
    app.run(debug=True)