import { exists, starts_with, ends_with, is_blank, zip, extend } from './helpers'
import Tabulator from './tabulator'

// converts text to JSON object
function parse_json_object(text)
{
	// ignore opening curly braces for now.
	// maybe support curly braces along with tabulation in future
	text = text.replace(/[\{\}]/g, '')

	return parse_lines(text.split('\n'))
}

// a node in style JSON object
// parse lines (using styles) into a JSON object with child nodes of this child node
function generate_node_json(name, styles, children_lines)
{
	const object = {}

	// transform styles from text to JSON objects
	const own_style = styles.map(function(style)
	{
		const parts = style.split(':')

		let key     = parts[0].trim()
		const value = parts[1].trim()

		// transform dashed key to camelCase key (it's required by React)
		key = key.replace(/([-]{1}[a-z]{1})/g, character => character.substring(1).toUpperCase())

		return { key, value }
	})
	// add own styles to the object
	.reduce(function(own_style, style)
	{
		own_style[style.key] = style.value
		return own_style
	}, 
	{})

	// apply the style to the object itself
	extend(object, own_style)

	// process child lines recursively
	const children = parse_lines(children_lines)

	// detect and expand modifier style classes
	Object.keys(children).filter(name => starts_with(name, '.')).forEach(function(name)
	{
		// remove the leading dot from the name
		children[name.substring('.'.length)] = extend({}, own_style, children[name])
		delete children[name]
	})

	// add children to the parent
	extend(object, children)

	// end this block
	return object
}

// parses lines of text into a JSON object
// (recursive function)
function parse_lines(lines)
{
	// return empty object if there are no lines
	if (!lines.length)
	{
		return {}
	}

	// ensure there are no blank lines at the start
	if (is_blank(lines[0]))
	{
		lines.shift()
		return parse_lines(lines)
	}

	// helper class for dealing with tabulation
	const tabulator = new Tabulator(Tabulator.determine_tabulation(lines))

	lines = tabulator.normalize_initial_tabulation(lines)
	.filter(function(line)
	{
		// ignore blank lines,
		// ignore single line comments (//)
		return !is_blank(line) && !line.match(/^[\s]*\/\//)
	})
	.map(function(line, index)
	{
		let original_line = line

		// get this line indentation and also trim the indentation
		const indentation = tabulator.calculate_indentation(line)
		line = tabulator.reduce_tabulation(line, indentation)

		// check for messed up space tabulation
		if (starts_with(line, ' '))
		{
			// #${line_index}
			throw new Error(`Invalid tabulation (some extra leading spaces) at line: "${line}"`)
		}

		// remove any trailing whitespace
		line = line.trim()

		const result = 
		{
			line          : line,
			index         : index,
			indentation   : indentation
		}

		return result
	})

	// determine lines with indentation = 1 (child node entry lines)
	const node_entry_lines = lines.filter(line_data => line_data.indentation === 1).map(line => line.index)

	// deduce corresponding child node ending lines
	const node_ending_lines = node_entry_lines.map(line_index => line_index - 1)
	node_ending_lines.shift()
	node_ending_lines.push(lines.length - 1)

	// each node boundaries in terms of starting line index and ending line index
	const from_to = zip(node_entry_lines, node_ending_lines)

	// now lines are split by nodes
	const each_node_lines = from_to.map(from_to => lines.slice(from_to[0], from_to[1] + 1))

	return each_node_lines.map(function(lines)
	{
		// the first line is the node's name
		let name = lines.shift().line

		// if someone forgot a trailing colon in the style class name - trim it
		// (or maybe these are Python people)
		if (ends_with(name, ':'))
		{
			name = name.substring(0, name.length - ':'.length)
			// throw new Error(`Remove the trailing colon at line: ${original_line}`)
		}

		// node's own styles
		let styles = lines.filter(function(line_info)
		{
			const line        = line_info.line
			const indentation = line_info.indentation

			// own styles always have indentation of 2
			if (indentation !== 2)
			{
				return
			}

			// detect generic css style line
			const colon_index = line.indexOf(':')
			return (colon_index > 0 && colon_index < line.length - 1) && !starts_with(line, '@')
		})

		// this node child nodes and all their children, etc
		let children_lines = lines.filter(function(line_info)
		{
			return styles.indexOf(line_info) < 0
		})

		// convert from line info to lines
		styles = styles.map(line_info => line_info.line)
		children_lines = children_lines.map(line_info => tabulator.tabulate(line_info.line, line_info.indentation - 1))

		// generate JSON object for this node
		const json = generate_node_json(name, styles, children_lines)

		return { name, json }
	})
	.reduce(function(nodes, node)
	{
		nodes[node.name] = node.json
		return nodes
	}, 
	{})
}

// using ES6 template strings
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings
export default function styler(strings, ...values)
{
	let style = ''

	// restore the whole string from "strings" and "values" parts
	let i = 0
	while (i < strings.length)
	{
		style += strings[i]
		if (exists(values[i]))
		{
			style += values[i]
		}
		i++
	}

	return parse_json_object(style)
}