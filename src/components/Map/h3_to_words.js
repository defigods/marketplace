// Caricare lista parole
let final_list = [];
var opt = new XMLHttpRequest();
opt.addEventListener('load', reqListener);
opt.open('GET', 'https://www.ovr.ai/wp-content/uploads/static/list_of_words_v1.json'); // Magari caricare da locale
opt.send();
function reqListener() {
	final_list = JSON.parse(this.responseText);
}

// Helpers calcoli
function add(x, y, base) {
	var z = [];
	var n = Math.max(x.length, y.length);
	191;
	var carry = 0;
	var i = 0;
	while (i < n || carry) {
		var xi = i < x.length ? x[i] : 0;
		var yi = i < y.length ? y[i] : 0;
		var zi = carry + xi + yi;
		z.push(zi % base);
		carry = Math.floor(zi / base);
		i++;
	}
	return z;
}

function multiplyByNumber(num, x, base) {
	if (num < 0) return null;
	if (num == 0) return [];

	var result = [];
	var power = x;
	while (true) {
		if (num & 1) {
			result = add(result, power, base);
		}
		num = num >> 1;
		if (num === 0) break;
		power = add(power, power, base);
	}

	return result;
}

function parseToDigitsArray(str, base) {
	var digits = str.split('');
	var ary = [];
	for (var i = digits.length - 1; i >= 0; i--) {
		var n = parseInt(digits[i], base);
		if (isNaN(n)) return null;
		ary.push(n);
	}
	return ary;
}

function convertBase(str, fromBase, toBase) {
	var digits = parseToDigitsArray(str, fromBase);
	if (digits === null) return null;

	var outArray = [];
	var power = [1];
	for (var i = 0; i < digits.length; i++) {
		if (digits[i]) {
			outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase);
		}
		power = multiplyByNumber(fromBase, power, toBase);
	}

	var out = '';
	for (var i = outArray.length - 1; i >= 0; i--) {
		out += outArray[i].toString(toBase);
	}
	return out;
}

let combinations_vocab = {
	0: '000',
	1: '001',
	2: '010',
	3: '011',
	4: '100',
	5: '101',
	6: '110',
	7: '111',
	8: '002',
	9: '012',
	10: '020',
	11: '021',
	12: '022',
	13: '102',
	14: '112',
	15: '120',
	16: '121',
	17: '122',
	18: '200',
	19: '201',
	20: '202',
	21: '210',
	22: '211',
	23: '212',
	24: '220',
	25: '221',
	26: '222',
};

// Funzioni calcolo nome

const from_triplet_to_h3 = (triplet) => {
	let h3_invariant_head = '10001100';
	let h3_invariant_tail = '111111111';

	let triplet_adj = [];
	let str_value = '';

	for (let i = 0; i < triplet.length; i++) {
		for (let j = 0; j < final_list.length; j++) {
			if (final_list[j] === triplet[i]) {
				str_value = j.toString();
			}
		}
		let length_string = str_value.length;

		if (length_string < 5) {
			for (let n = 0; n < 5 - length_string; n++) {
				str_value = '0' + str_value;
			}
		}

		triplet_adj.push(str_value);
	}

	let first_trinary_code =
		triplet_adj[0].substring(0, 1) + triplet_adj[1].substring(0, 1) + triplet_adj[2].substring(0, 1);
	let first_integer_value = 0;

	for (let key in combinations_vocab) {
		if (combinations_vocab[key] === first_trinary_code) {
			first_integer_value = key;
		}
	}
	let full_integer =
		first_integer_value.toString() +
		triplet_adj[0].substring(1) +
		triplet_adj[1].substring(1) +
		triplet_adj[2].substring(1);
	let binary_full_integer = convertBase(full_integer, 10, 2);
	let binary_full_integer_length = binary_full_integer.length;

	for (let i = 0; i < 43 - binary_full_integer_length; i++) {
		binary_full_integer = '0' + binary_full_integer;
	}

	let whole_binary = h3_invariant_head + binary_full_integer + h3_invariant_tail;
	let h3_index = convertBase(whole_binary, 2, 16);
	return h3_index;
};

const form_h3_to_words = (h3_address) => {
	let binary = convertBase(h3_address, 16, 2);
	let binary_clean = binary.substr(8, 43);
	let integer = parseInt(binary_clean, 2);
	let str_integer = integer.toString();
	let integer_length = str_integer.length;
	if (integer_length < 13) {
		for (let i = 0; i < 13 - integer_length; i++) {
			str_integer = '0' + str_integer;
		}
	}
	let integer_first_value = str_integer[0];
	let first_word_idx = parseInt(
		combinations_vocab[parseInt(integer_first_value)].substring(0, 1) + str_integer.substring(1, 5),
	);
	let first_word = final_list[first_word_idx];
	let second_word_idx = parseInt(combinations_vocab[parseInt(integer_first_value)][1] + str_integer.substring(5, 9));
	let second_word = final_list[second_word_idx];
	let third_word_idx = parseInt(combinations_vocab[parseInt(integer_first_value)][2] + str_integer.substring(9));
	let third_word = final_list[third_word_idx];
	return [first_word, second_word, third_word];
};

// ESEMPI

// form_h3_to_words("8c1e50a6d7941ff");
// from_triplet_to_h3(["food","georgia","keller"])

