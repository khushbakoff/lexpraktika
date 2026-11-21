import sys,re
f,nums=sys.argv[1],sys.argv[2:]
t=open(f,encoding="utf-8").read().split("\n")
idx=[i for i,l in enumerate(t) if re.match(r"^\d+-(?:модда|modda)\.",l)]
for n in nums:
    hits=[i for i in idx if (t[i].startswith(n+"-модда.") or t[i].startswith(n+"-modda."))]
    if not hits: print(f"== {n}: TOPILMADI"); continue
    i=hits[-1]  # tana (TOC dan keyingi)
    nxt=[j for j in idx if j>i]
    end=nxt[0] if nxt else i+40
    print(f"== {n} (qator {i})"); print("\n".join(t[i:min(end,i+45)])[:2600]); print()
