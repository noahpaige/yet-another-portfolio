# Step 1 Audit Report: MDX Frontmatter vs Index.ts Metadata

## Executive Summary

This audit examines the current state of metadata across all 7 projects in the portfolio, comparing the data in `index.ts` files versus MDX frontmatter. The goal is to identify what needs to be migrated to achieve a unified articles system.

## Current Project Inventory

| Project           | Directory            | Has index.ts | Has MDX Frontmatter | Type Field | Status       |
| ----------------- | -------------------- | ------------ | ------------------- | ---------- | ------------ |
| Clair Obscur      | `clair-obscur/`      | ✅           | ✅                  | ✅         | **Complete** |
| Control           | `control/`           | ✅           | ✅                  | ✅         | **Complete** |
| Cyberpunk 2077    | `cyberpunk-2077/`    | ✅           | ✅                  | ✅         | **Complete** |
| Death Stranding   | `death-stranding/`   | ✅           | ✅                  | ✅         | **Complete** |
| Ghost of Tsushima | `ghost-of-tsushima/` | ✅           | ✅                  | ✅         | **Complete** |
| Indiana Jones     | `indiana-jones/`     | ✅           | ✅                  | ✅         | **Complete** |
| Masters Thesis    | `masters-thesis/`    | ✅           | ✅                  | ✅         | **Complete** |

## Detailed Analysis by Project

### 1. Clair Obscur: Expedition 33

**Status**: ✅ **Complete** - All metadata present in MDX frontmatter

**index.ts Fields**:

- `id`: "clair-obscur"
- `title`: "Grow Old"
- `tags`: ["RPG", "Turn-based", "Artistic"]
- `image`: "/clair_obscure.png"
- `imageAltText`: "It's harder than you think!"
- `timestamp`: "2024-01-15T00:00:00Z"
- `featured`: true
- `featuredOrder`: 1
- `colorPairs`: [Array of HSL color pairs]

**MDX Frontmatter**:

- `title`: "Clair Obscur: Expedition 33" ✅
- `description`: "A world painted in despair and beauty..." ✅
- `type`: "project" ✅
- `date`: "2024-01-15" ✅
- `readTime`: 8 ✅
- `tags`: ["RPG", "Turn-based", "Artistic", "Story-driven"] ✅
- `seo`: Complete SEO object ✅

**Migration Notes**:

- ✅ All required fields present in MDX
- ✅ Enhanced with additional tags and SEO
- ❌ Missing `colorPairs` in MDX (needed for animated backgrounds)
- ❌ Missing `imageAltText` in MDX
- ❌ Missing `featured` and `featuredOrder` in MDX

### 2. Control

**Status**: ⚠️ **Incomplete** - Missing several fields in MDX

**index.ts Fields**:

- `id`: "control"
- `title`: "Pick up the phone"
- `tags`: ["Action", "Supernatural", "Thriller"]
- `image`: "/control.jpg"
- `imageAltText`: "How does the director even get over there?"
- `timestamp`: "2024-02-20T00:00:00Z"
- `featured`: true
- `featuredOrder`: 2

**MDX Frontmatter**:

- `title`: "Control" ✅
- `description`: "A psychological thriller where reality bends..." ✅
- `type`: "project" ✅

**Migration Notes**:

- ❌ Missing `date`, `readTime`, `tags`, `seo` in MDX
- ❌ Missing `imageAltText`, `featured`, `featuredOrder` in MDX
- ❌ Missing `image` path in MDX

### 3. Cyberpunk 2077

**Status**: ✅ **Complete** - All metadata present in MDX frontmatter

**index.ts Fields**:

- `id`: "cyberpunk-2077"
- `title`: "For my Choom"
- `tags`: ["RPG", "Cyberpunk", "Open World"]
- `image`: "/choom.png"
- `imageAltText`: "My Number 1 Choom"
- `timestamp`: "2024-03-10T00:00:00Z"
- `featured`: true
- `featuredOrder`: 3

**MDX Frontmatter**:

- `title`: "Cyberpunk 2077" ✅
- `description`: "Welcome to Night City, Choom..." ✅
- `type`: "project" ✅
- `date`: "2024-02-10" ✅
- `readTime`: 12 ✅
- `tags`: ["RPG", "Cyberpunk", "Open World", "Action", "Sci-Fi"] ✅
- `seo`: Complete SEO object ✅

**Migration Notes**:

- ✅ All required fields present in MDX
- ✅ Enhanced with additional tags and SEO
- ❌ Missing `imageAltText`, `featured`, `featuredOrder` in MDX
- ❌ Missing `image` path in MDX

### 4. Death Stranding

**Status**: ⚠️ **Incomplete** - Missing several fields in MDX

**index.ts Fields**:

- `id`: "death-stranding"
- `title`: "Deliver Packages"
- `tags`: ["Survival", "Horror", "Post-apocalyptic"]
- `image`: "/death_stranding.png"
- `imageAltText`: "Troy Baker babysitting."
- `timestamp`: "2024-04-05T00:00:00Z"
- `featured`: true
- `featuredOrder`: 4

**MDX Frontmatter**:

- `title`: "The Death Stranding" ✅
- `description`: "Keep on keeping on..." ✅
- `type`: "project" ✅

**Migration Notes**:

- ❌ Missing `date`, `readTime`, `tags`, `seo` in MDX
- ❌ Missing `imageAltText`, `featured`, `featuredOrder` in MDX
- ❌ Missing `image` path in MDX

### 5. Ghost of Tsushima

**Status**: ⚠️ **Incomplete** - Missing several fields in MDX

**index.ts Fields**:

- `id`: "ghost-of-tsushima"
- `title`: "Defend Tsushima"
- `tags`: ["Action", "Open World", "Samurai"]
- `image`: "/ghost_of_tsushima.png"
- `imageAltText`: "Jin Sakai sheathes his sword."
- `timestamp`: "2024-05-15T00:00:00Z"
- `featured`: true
- `featuredOrder`: 5
- `colorPairs`: [Array of HSL color pairs]

**MDX Frontmatter**:

- `title`: "Ghost of Tsushima" ✅
- `description`: "The way of the samurai is found in death..." ✅
- `type`: "project" ✅

**Migration Notes**:

- ❌ Missing `date`, `readTime`, `tags`, `seo` in MDX
- ❌ Missing `imageAltText`, `featured`, `featuredOrder` in MDX
- ❌ Missing `image` path in MDX
- ❌ Missing `colorPairs` in MDX (needed for animated backgrounds)

### 6. Indiana Jones: The Great Circle

**Status**: ⚠️ **Incomplete** - Missing several fields in MDX

**index.ts Fields**:

- `id`: "indiana-jones"
- `title`: "Find the Great Circle"
- `tags`: ["Adventure", "Action", "Archaeology"]
- `image`: "/indiana_jones.png"
- `imageAltText`: "Gotcha!"
- `timestamp`: "2024-06-20T00:00:00Z"
- `featured`: true
- `featuredOrder`: 6

**MDX Frontmatter**:

- `title`: "Indiana Jones: The Great Circle" ✅
- `description`: "Dust off the fedora. Grab the whip..." ✅
- `type`: "project" ✅

**Migration Notes**:

- ❌ Missing `date`, `readTime`, `tags`, `seo` in MDX
- ❌ Missing `imageAltText`, `featured`, `featuredOrder` in MDX
- ❌ Missing `image` path in MDX

### 7. Masters Thesis

**Status**: ⚠️ **Incomplete** - Missing several fields in MDX

**index.ts Fields**:

- `id`: "masters-thesis"
- `title`: "Masters Thesis"
- `tags`: ["Research", "Academic", "Thesis"]
- `image`: "/masters-thesis.png"
- `imageAltText`: "Masters thesis research and academic work"
- `timestamp`: "2024-12-01T00:00:00Z"
- `featured`: true
- `featuredOrder`: 1

**MDX Frontmatter**:

- `title`: "Masters Thesis" ✅
- `description`: "Academic research and thesis work" ✅
- `type`: "project" ✅

**Migration Notes**:

- ❌ Missing `date`, `readTime`, `tags`, `seo` in MDX
- ❌ Missing `imageAltText`, `featured`, `featuredOrder` in MDX
- ❌ Missing `image` path in MDX

## Key Findings

### ✅ What's Working Well

1. **Type Field**: All projects have `type: "project"` in MDX frontmatter
2. **Enhanced Frontmatter**: Clair Obscur and Cyberpunk 2077 have complete, enhanced frontmatter
3. **Schema Support**: Enhanced frontmatter schemas already exist and support all needed fields
4. **Unified System**: `src/lib/unified-projects.ts` already provides unified access

### ❌ Critical Gaps to Address

1. **Inconsistent Metadata**: 5 out of 7 projects missing key fields in MDX frontmatter
2. **Missing Fields**: Most projects missing `date`, `readTime`, `tags`, `seo`, `image`, `imageAltText`, `featured`, `featuredOrder`
3. **Special Fields**: `colorPairs` missing from MDX (needed for animated backgrounds)
4. **Dual Metadata**: Still relying on both `index.ts` and MDX frontmatter

### 🔧 Required Schema Updates

The current `ProjectFrontmatterSchema` needs to be extended to include:

- `image`: string (required)
- `imageAltText`: string (required)
- `featured`: boolean (optional)
- `featuredOrder`: number (optional)
- `colorPairs`: array (optional, for animated backgrounds)

## Migration Priority

### High Priority (Complete MDX Frontmatter)

1. **Clair Obscur** - Add missing `colorPairs`, `imageAltText`, `featured`, `featuredOrder`
2. **Cyberpunk 2077** - Add missing `imageAltText`, `featured`, `featuredOrder`

### Medium Priority (Add Core Fields)

3. **Control** - Add `date`, `readTime`, `tags`, `seo`, `image`, `imageAltText`, `featured`, `featuredOrder`
4. **Death Stranding** - Add `date`, `readTime`, `tags`, `seo`, `image`, `imageAltText`, `featured`, `featuredOrder`
5. **Ghost of Tsushima** - Add `date`, `readTime`, `tags`, `seo`, `image`, `imageAltText`, `featured`, `featuredOrder`, `colorPairs`
6. **Indiana Jones** - Add `date`, `readTime`, `tags`, `seo`, `image`, `imageAltText`, `featured`, `featuredOrder`
7. **Masters Thesis** - Add `date`, `readTime`, `tags`, `seo`, `image`, `imageAltText`, `featured`, `featuredOrder`

## Next Steps

1. **Update Schema**: Extend `ProjectFrontmatterSchema` to include all required fields
2. **Migrate Metadata**: Move all `index.ts` data to MDX frontmatter for each project
3. **Validate**: Ensure all projects pass enhanced frontmatter validation
4. **Test**: Verify that unified system works with complete MDX metadata
5. **Remove**: Delete `index.ts` files once migration is complete

## Risk Assessment

**Low Risk**:

- Enhanced frontmatter schemas already exist
- Unified system already implemented
- Clair Obscur and Cyberpunk 2077 provide good templates

**Medium Risk**:

- `colorPairs` field is critical for animated backgrounds
- Need to ensure all components can access data from MDX only
- Featured order and image paths must be preserved exactly

**Mitigation**:

- Test each project individually after migration
- Keep `index.ts` files as backup until fully validated
- Use existing unified system as foundation
