from flask import Flask, request, jsonify
from flask_cors import CORS
from scipy.spatial import ConvexHull
import numpy as np

app = Flask(__name__)
CORS(app)

def compute_hull(points):
    pts = np.array(points)

    if len(pts) < 4:
        return None

    hull = ConvexHull(pts)

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