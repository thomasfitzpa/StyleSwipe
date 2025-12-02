import React, { useEffect, useState } from "react";
import { apiFetch } from "./auth";

// Props: { item, onClose, onAdded }
export default function AddToCartModal({ item, cartItems = [], onClose, onAdded }) {
	const [error, setError] = useState(null);
	const [submitError, setSubmitError] = useState(null);
	const [selectedSize, setSelectedSize] = useState("");
	const [selectedColor, setSelectedColor] = useState("");
	const [quantity, setQuantity] = useState(1);

	const ITEMS_API = "http://localhost:5000/api/items";
	const USERS_API = "http://localhost:5000/api/users";

	// Convert storage or S3-style URIs to public HTTPS URLs
	const normalizeImageUrl = (url) => {
		if (!url) return url;
		const s3Match = /^s3:\/\/([^\/]+)\/(.+)$/.exec(url);
		if (s3Match) {
			const bucket = s3Match[1];
			const key = s3Match[2];
			return `https://${bucket}.s3.amazonaws.com/${key}`;
		}
		// Handle gs://bucket/key (GCS) similarly if present
		const gcsMatch = /^gs:\/\/([^\/]+)\/(.+)$/.exec(url);
		if (gcsMatch) {
			const bucket = gcsMatch[1];
			const key = gcsMatch[2];
			return `https://storage.googleapis.com/${bucket}/${key}`;
		}
		return url;
	};

	useEffect(() => {
		if (!item) return;
		if (Array.isArray(item.availableSizes) && item.availableSizes.length) {
			setSelectedSize(item.availableSizes[0]);
		}
		if (Array.isArray(item.availableColors) && item.availableColors.length) {
			setSelectedColor(item.availableColors[0]);
		}
	}, [item]);

	// Resolve canonical keys to match stock map by case-insensitive comparison
	const resolveCanonical = (value, candidates) => {
		if (!value) return value;
		if (!Array.isArray(candidates) || candidates.length === 0) return value;
		const v = String(value).trim().toLowerCase();
		for (const c of candidates) {
			if (String(c).trim().toLowerCase() === v) return c;
		}
		return value;
	};

	const getMaxQuantity = () => {
		if (!item || !selectedSize || !selectedColor) return 0;
		const stock = item.stock || {};
		// Normalize possible nested stock shapes: stock[size][color] OR flat object keys
		let available = 0;
		const sizeKey = resolveCanonical(selectedSize, Object.keys(stock || {}));
		const colorCandidates = (item.availableColors || []);
		const colorKey = resolveCanonical(selectedColor, colorCandidates);
		if (stock[sizeKey] && typeof stock[sizeKey] === 'object') {
			available = Number(stock[sizeKey]?.[colorKey] ?? 0);
		} else if (typeof stock === 'object') {
			// try combined key like "M|Gray" or "M_Gray"
			const combined1 = `${sizeKey}|${colorKey}`;
			const combined2 = `${sizeKey}_${colorKey}`;
			available = Number(stock[combined1] ?? stock[combined2] ?? 0);
		}
		// Subtract any existing quantity in the cart for this exact item/size/color
		const itemIdStr = String(item._id || item.id || item.itemId || item.item);
		const existingQty = (cartItems || []).reduce((sum, ci) => {
			const ciId = String((ci.item && ci.item._id) || ci.itemId || ci.item);
			const match = ciId === itemIdStr && String(ci.selectedSize) === String(sizeKey) && String(ci.selectedColor) === String(colorKey);
			return match ? sum + Number(ci.quantity || 0) : sum;
		}, 0);
		const remaining = Number.isFinite(available) ? Math.max(0, available - existingQty) : 0;
		return remaining;
	};

	useEffect(() => {
		// Reset quantity within bounds when selection changes
		const maxQ = getMaxQuantity();
		setQuantity((q) => {
			if (maxQ <= 0) return 0; // show 0 when out of stock
			return Math.min(Math.max(1, q || 1), maxQ);
		});
		setSubmitError(null);
	}, [selectedSize, selectedColor]);

	const handleAdd = async () => {
		const maxQ = getMaxQuantity();
		if (maxQ <= 0) {
			setSubmitError("Out of stock for selected options");
			return;
		}
		const payload = {
			itemId: item._id || item.id,
			selectedSize: resolveCanonical(selectedSize, item.availableSizes || []),
			selectedColor: resolveCanonical(selectedColor, item.availableColors || []),
			quantity: Math.min(parseInt(quantity || 1, 10), maxQ),
		};
		
		console.log('Add to cart payload:', payload);
		
		try {
			const res = await apiFetch(`${USERS_API}/account/add-to-cart`, {
				method: "POST",
				body: JSON.stringify(payload),
			});
			const data = await res.json().catch(() => null);
			console.log('Add to cart response:', { ok: res.ok, status: res.status, data });
			
			if (!res.ok) {
				// Extract validation errors if present
				let message = "Failed to add to cart";
				if (data) {
					if (data.errors && Array.isArray(data.errors)) {
						message = data.errors.map(e => e.msg || e.message).join(', ');
					} else if (data.error?.message) {
						message = data.error.message;
					} else if (data.message) {
						message = data.message;
					}
				}
				setSubmitError(message);
				return;
			}
			setSubmitError(null);
			if (onAdded) onAdded(data);
			// Emit cartUpdated so header counters update
			window.dispatchEvent(new CustomEvent("cartUpdated"));
			onClose();
		} catch (e) {
			console.error('Add to cart error:', e);
			setSubmitError(e.message || "Failed to add to cart");
		}
	};

	if (!item) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-end">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
			<div className="relative w-full max-w-md h-full bg-[#1a1a24] border-l border-white/10 shadow-2xl overflow-y-auto">
				<div className="sticky top-0 bg-[#1a1a24] border-b border-white/10 p-5 flex items-center justify-between">
					<h2 className="text-xl font-bold text-white">Select Options</h2>
					<button onClick={onClose} className="text-[#a6a6b3] hover:text-white text-2xl">×</button>
				</div>
				<div className="p-5">
					{error ? (
						<p className="text-red-400">{error}</p>
					) : (
						<>
							<div className="flex gap-4 mb-4">
								<img
									src={normalizeImageUrl((Array.isArray(item.images) && item.images[0]) || item.image) || "https://via.placeholder.com/100"}
									alt={item.name}
									className="w-20 h-20 object-cover rounded-lg"
								/>
								<div>
									<h3 className="text-white font-bold">{item.name}</h3>
									<p className="text-[#a6a6b3]">${Number(item.price || 0).toFixed(2)}</p>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-[#a6a6b3] mb-2">Size</label>
									<select
										value={selectedSize}
										onChange={(e) => setSelectedSize(e.target.value)}
										className="w-full px-3 py-2 rounded-lg bg-white/[0.08] border border-white/20 text-white"
									>
										{(item.availableSizes || []).map((s) => (
											<option key={s} value={s}>{s}</option>
										))}
									</select>
									{(!item.availableSizes || item.availableSizes.length === 0) && (
										<p className="text-[#a6a6b3] text-xs mt-1">No sizes listed for this item.</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-[#a6a6b3] mb-2">Color</label>
									<select
										value={selectedColor}
										onChange={(e) => setSelectedColor(e.target.value)}
										className="w-full px-3 py-2 rounded-lg bg-white/[0.08] border border-white/20 text-white"
									>
										{(item.availableColors || []).map((c) => (
											<option key={c} value={c}>{c}</option>
										))}
									</select>
									{(!item.availableColors || item.availableColors.length === 0) && (
										<p className="text-[#a6a6b3] text-xs mt-1">No colors listed for this item.</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-[#a6a6b3] mb-2">Quantity</label>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => setQuantity((q) => {
												const maxQ = getMaxQuantity();
												if (maxQ <= 0) return 0;
												return Math.max(1, (q || 1) - 1);
											})}
											className="w-8 h-8 rounded-lg bg-white/[0.1] border border-white/20 text-white"
										>
											−
										</button>
										<input
											type="number"
											min={getMaxQuantity() > 0 ? 1 : 0}
											max={getMaxQuantity() || 0}
											value={getMaxQuantity() > 0 ? (quantity || 1) : 0}
											onChange={(e) => {
												const val = Number(e.target.value || 1);
												const maxQ = getMaxQuantity() || 1;
												if (maxQ <= 0) {
													setQuantity(0);
												} else {
													setQuantity(Math.min(Math.max(1, val), maxQ));
												}
											}}
											className="w-20 px-3 py-2 rounded-lg bg-white/[0.08] border border-white/20 text-white"
										/>
										<button
											type="button"
											onClick={() => setQuantity((q) => {
												const maxQ = getMaxQuantity();
												if (maxQ <= 0) return 0;
												return Math.min(maxQ, (q || 1) + 1);
											})}
											className="w-8 h-8 rounded-lg bg-white/[0.1] border border-white/20 text-white"
										>
											+
										</button>
										<span className="text-[#a6a6b3] text-sm">
											In stock: {getMaxQuantity()}
										</span>
									</div>
								</div>

								<button
									disabled={getMaxQuantity() <= 0}
									onClick={handleAdd}
									className="w-full mt-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-br from-primary to-secondary text-dark-bg disabled:opacity-50"
								>
									Add to Cart
								</button>
								{submitError && (
									<p className="text-red-400 text-sm mt-3">{submitError}</p>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

