# TODOS

## Search Content Safety for Children
**What:** Add content safety layer to knowledge search pipeline (query sanitization + result moderation).
**Why:** Raw child input goes directly to Tavily search, and results are injected into child-facing responses without filtering. Age-inappropriate content could surface.
**Pros:** Essential for any production deployment of a children's service.
**Cons:** Requires choosing a moderation API or building allowlist-based filtering, adds latency to search flow.
**Context:** Currently `supervisor.py:60` forwards raw child text as search_query, `tools.py:11` pulls arbitrary web snippets, and `conversation.py:23` injects them into the Bomi prompt. No PII minimization, no source allowlist, no moderation layer. At minimum, needs: (1) query sanitization to strip PII, (2) result content moderation before injection, (3) source domain allowlist for kid-safe sites.
**Depends on / blocked by:** Nothing. Can be added independently to `knowledge.py` and `tools.py`.
