import { baseParse, createSimpleExpression, NodeTypes } from '@vue/compiler-dom'
import type { ElementNode, NodeTransform, TemplateChildNode } from '@vue/compiler-dom'

const skippedTags = new Set(['pre', 'code', 'kbd', 'samp', 'svg', 'math', 'script', 'style', 'textarea', 'option', 'iframe', 'PhraseText'])

// Rewrite the uncompiled template at the root, before Vue traverses its children.
// Vue then owns the wrappers, so interpolation updates, v-for and navigation
// cannot leave stale text or conflict with DOM observers.
export const phraseTextTransform: NodeTransform = (root) => {
  if (root.type !== NodeTypes.ROOT) return
  const visit = (children: TemplateChildNode[]) => {
    for (let index = 0; index < children.length; index++) {
      const node = children[index]!
      if (node.type === NodeTypes.ELEMENT) {
        const optedOut = node.props.some(prop => prop.type === NodeTypes.ATTRIBUTE && (
          prop.name === 'contenteditable' || prop.name === 'data-wrap' && prop.value?.content === 'off'
        ))
        if (!skippedTags.has(node.tag) && !optedOut) visit(node.children)
      } else if (node.type === NodeTypes.INTERPOLATION || node.type === NodeTypes.TEXT && node.content.trim()) {
        const adjacent: TemplateChildNode[] = [node]
        while (children[index + adjacent.length]?.type === NodeTypes.TEXT || children[index + adjacent.length]?.type === NodeTypes.INTERPOLATION) {
          adjacent.push(children[index + adjacent.length]!)
        }
        const wrapper = baseParse('<PhraseText :text="value" />').children[0] as ElementNode
        if (adjacent.length > 1) {
          // Let Vue compile adjacent literals/interpolations as a text slot.
          // Segment their combined value, including e.g. Ver.{{version}}.
          wrapper.props = []
          wrapper.children = adjacent
        } else {
          const binding = wrapper.props[0]!
          if (binding.type !== NodeTypes.DIRECTIVE) continue
          binding.exp = node.type === NodeTypes.INTERPOLATION
            ? node.content
            : createSimpleExpression(JSON.stringify(node.content), false)
        }
        wrapper.loc = node.loc
        children.splice(index, adjacent.length, wrapper)
      }
    }
  }
  visit(root.children)
}
