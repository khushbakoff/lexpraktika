import sys, re, html
from html.parser import HTMLParser
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.out=[]; s.skip=0
    def handle_starttag(s,t,a):
        if t in("script","style","noscript"): s.skip+=1
        if t in("p","div","br","li","h1","h2","h3","h4","tr"): s.out.append("\n")
    def handle_endtag(s,t):
        if t in("script","style","noscript"): s.skip=max(0,s.skip-1)
    def handle_data(s,d):
        if not s.skip: s.out.append(d)
src,dst=sys.argv[1],sys.argv[2]
p=P(); p.feed(open(src,encoding="utf-8",errors="replace").read())
t=html.unescape("".join(p.out))
t=re.sub(r"[ \t ]+"," ",t); t=re.sub(r"\n\s*\n+","\n",t)
open(dst,"w",encoding="utf-8").write(t)
print(dst,len(t))
