import sys
import numpy as np
import pandas as pd

SEED = 0


def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -30, 30)))


def fit_logreg(X, y, iters=20000, lr=0.1):
    """Full-batch gradient descent on binary cross-entropy. X assumed standardized."""
    n, d = X.shape
    w = np.zeros(d)
    b = 0.0
    for _ in range(iters):
        p = sigmoid(X @ w + b)
        w -= lr * (X.T @ (p - y) / n)
        b -= lr * (p - y).mean()
    return w, b


def cross_val_accuracy(Xn, y, k=5, seed=SEED):
    rng = np.random.default_rng(seed)
    idx = rng.permutation(len(y))
    folds = np.array_split(idx, k)
    accs = []
    for i in range(k):
        te = folds[i]
        tr = np.concatenate([folds[j] for j in range(k) if j != i])
        w, b = fit_logreg(Xn[tr], y[tr])
        pred = (sigmoid(Xn[te] @ w + b) >= 0.5).astype(int)
        accs.append((pred == y[te]).mean())
    return float(np.mean(accs)), float(np.std(accs))


def main(path):
    df = pd.read_csv(path)
    X = df[["red", "green", "blue"]].values.astype(float)
    y = df["darkness"].values.astype(int)

    # Standardize features (helps gradient descent converge evenly).
    mu = X.mean(axis=0)
    sd = X.std(axis=0)
    Xn = (X - mu) / sd

    # 5-fold cross-validated accuracy (honest estimate on unseen data).
    cv_mean, cv_std = cross_val_accuracy(Xn, y)
    print(f"5-fold CV accuracy: {cv_mean:.4f} +/- {cv_std:.4f}")

    # Final fit on all data.
    w, b = fit_logreg(Xn, y)
    train_acc = ((sigmoid(Xn @ w + b) >= 0.5).astype(int) == y).mean()
    print(f"Train accuracy:     {train_acc:.4f}")

    # Convert standardized weights back to raw 0-255 coordinates.
    w_raw = w / sd
    b_raw = b - np.sum(w * mu / sd)
    print("\nModel in raw (0-255) units:")
    print(
        f"  P(dark) = sigmoid({b_raw:+.4f} "
        f"{w_raw[0]:+.5f}*R {w_raw[1]:+.5f}*G {w_raw[2]:+.5f}*B)"
    )
    print("  Predict DARK when P >= 0.5.\n")

    # Normalized channel importance (how much each channel drives 'dark').
    imp = -w_raw / (-w_raw).sum()
    print(f"Channel weights (normalized)  R:{imp[0]:.3f}  G:{imp[1]:.3f}  B:{imp[2]:.3f}")

    return w_raw, b_raw


def predict(rgb, w_raw, b_raw):
    """rgb: array-like of shape (...,3) in 0-255. Returns P(dark)."""
    rgb = np.asarray(rgb, dtype=float)
    return sigmoid(rgb @ w_raw + b_raw)


if __name__ == "__main__":
    csv = sys.argv[1] if len(sys.argv) > 1 else "darkness.csv"
    main(csv)
