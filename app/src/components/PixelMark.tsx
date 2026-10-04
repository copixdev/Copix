/** Four-square pixel mark. Decorative; not a product window. */
export function PixelMark() {
	return (
		<span className="pixel-mark" aria-hidden="true">
			<span className="px px-rust" />
			<span className="px px-ink" />
			<span className="px px-paper" />
			<span className="px px-sage" />
		</span>
	);
}
