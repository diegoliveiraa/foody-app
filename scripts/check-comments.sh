#!/usr/bin/env bash
set -euo pipefail

violations=""
for file in $(git ls-files --cached --others --exclude-standard --deduplicate -- '*.ts' '*.tsx' ':!src/@types/api.d.ts'); do
	[ -f "$file" ] || continue
	hits=$(sed -E "s/'(\\.|[^'\\])*'/''/g; s/\"(\\.|[^\"\\])*\"/\"\"/g; s/\`(\\.|[^\`\\])*\`/\`\`/g" "$file" \
		| grep -nE '//|/\*|^\s*\*' | grep -vE 'oxlint-|eslint-|@ts-|prettier-ignore' || true)
	[ -z "$hits" ] || violations+="$(printf '%s\n' "$hits" | sed "s|^|$file:|")"$'\n'
done

if [ -n "$violations" ]; then
	printf '%s' "$violations"
	echo "R14: the lines above carry comments — remove them."
	exit 1
fi
echo "R14: no comments."
