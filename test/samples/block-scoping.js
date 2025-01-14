module.exports = [
	{
		description: 'transpiles let',
		input: `let x = 'y';`,
		output: `var x = 'y';`
	},

	{
		description: 'deconflicts blocks in top-level scope',

		input: `
			if ( a ) {
				let x = 1;
				console.log( x );
			} else if ( b ) {
				let x = 2;
				console.log( x );
			} else {
				let x = 3;
				console.log( x );
			}`,

		output: `
			if ( a ) {
				var x = 1;
				console.log( x );
			} else if ( b ) {
				var x$1 = 2;
				console.log( x$1 );
			} else {
				var x$2 = 3;
				console.log( x$2 );
			}`
	},

	{
		description: 'deconflicts blocks in same function scope',

		input: `
			var x = 'y';
			function foo () {
				if ( a ) {
					let x = 1;
					console.log( x );
				} else if ( b ) {
					let x = 2;
					console.log( x );
				} else {
					let x = 3;
					console.log( x );
				}
			}`,

		output: `
			var x = 'y';
			function foo () {
				if ( a ) {
					var x = 1;
					console.log( x );
				} else if ( b ) {
					var x$1 = 2;
					console.log( x$1 );
				} else {
					var x$2 = 3;
					console.log( x$2 );
				}
			}`
	},

	{
		description: 'disallows duplicate declarations',
		input: `
			let x = 1;
			let x = 2;
		`,
		error: /Identifier 'x' has already been declared/
	},

	{
		description: 'disallows reassignment to constants',
		input: `
			const x = 1;
			x = 2;
		`,
		error: /x is read-only/
	},

	{
		description: 'disallows destructured reassignment to constants, short-hand property',
		input: `
			const x = 1;
			({ x } = {});
		`,
		error: /x is read-only/
	},

	{
		description: 'disallows destructured reassignment to constants, rest property',
		input: `
			const x = 1;
			({ ...x } = {});
		`,
		error: /x is read-only/
	},

	{
		description: 'disallows destructured reassignment to constants, renamed property',
		input: `
			const x = 1;
			({ y: x } = {});
		`,
		error: /x is read-only/
	},

	{
		description: 'disallows destructured reassignment to constants, array',
		input: `
			const x = 1;
			([ x ] = []);
		`,
		error: /x is read-only/
	},

	{
		description: 'disallows destructured reassignment to constants, rest element',
		input: `
			const x = 1;
			([ ...x ] = []);
		`,
		error: /x is read-only/
	},

	{
		description: 'disallows updates to constants',
		input: `
			const x = 1;
			x++;
		`,
		error: /x is read-only/
	},

	{
		description: 'does not rewrite properties',

		input: `
			var foo = 'x';
			if ( true ) {
				let foo = 'y';
				this.foo = 'z';
				this[ foo ] = 'q';
			}`,

		output: `
			var foo = 'x';
			if ( true ) {
				var foo$1 = 'y';
				this.foo = 'z';
				this[ foo$1 ] = 'q';
			}`
	},

	{
		description: 'deconflicts with default imports',
		options: { transforms: { moduleImport: false } },

		input: `
			import foo from './foo.js';

			if ( x ) {
				let foo = 'y';
				console.log( foo );
			}`,

		output: `
			import foo from './foo.js';

			if ( x ) {
				var foo$1 = 'y';
				console.log( foo$1 );
			}`
	},

	{
		description: 'deconflicts with named imports',
		options: { transforms: { moduleImport: false } },

		input: `
			import { foo } from './foo.js';

			if ( x ) {
				let foo = 'y';
				console.log( foo );
			}`,

		output: `
			import { foo } from './foo.js';

			if ( x ) {
				var foo$1 = 'y';
				console.log( foo$1 );
			}`
	},

	{
		description: 'deconflicts with function declarations',

		input: `
			function foo () {}

			if ( x ) {
				let foo = 'y';
				console.log( foo );
			}`,

		output: `
			function foo () {}

			if ( x ) {
				var foo$1 = 'y';
				console.log( foo$1 );
			}`
	},

	{
		description: 'does not deconflict with function expressions',

		input: `
			var bar = function foo () {};

			if ( x ) {
				let foo = 'y';
				console.log( foo );
			}`,

		output: `
			var bar = function foo () {};

			if ( x ) {
				var foo = 'y';
				console.log( foo );
			}`
	},

	{
		description: 'deconflicts with function expression inside function body',

		input: `
			var bar = function foo () {
				if ( x ) {
					let foo = 'y';
					console.log( foo );
				}
			};`,

		output: `
			var bar = function foo () {
				if ( x ) {
					var foo$1 = 'y';
					console.log( foo$1 );
				}
			};`
	},

	{
		description: 'deconflicts with parameters',

		input: `
			function bar ( foo ) {
				if ( x ) {
					let foo = 'y';
					console.log( foo );
				}
			}`,

		output: `
			function bar ( foo ) {
				if ( x ) {
					var foo$1 = 'y';
					console.log( foo$1 );
				}
			}`
	},

	{
		description: 'deconflicts with class declarations',

		input: `
			class foo {}

			if ( x ) {
				let foo = 'y';
				console.log( foo );
			}`,

		output: `
			var foo = function foo () {};

			if ( x ) {
				var foo$1 = 'y';
				console.log( foo$1 );
			}`
	},

	{
		description: 'does not deconflict with class expressions',

		input: `
			var bar = class foo {};

			if ( x ) {
				let foo = 'y';
				console.log( foo );
			}`,

		output: `
			var bar = /*@__PURE__*/(function () {
				function foo () {}

				return foo;
			}());

			if ( x ) {
				var foo = 'y';
				console.log( foo );
			}`
	},

	{
		description: 'deconflicts across multiple function boundaries',

		input: `
			function foo ( x ) {
				return function () {
					if ( true ) {
						const x = 'y';
						console.log( x );
					}

					console.log( x );
				};
			}`,

		output: `
			function foo ( x ) {
				return function () {
					if ( true ) {
						var x$1 = 'y';
						console.log( x$1 );
					}

					console.log( x );
				};
			}`
	},

	{
		description: 'does not deconflict unnecessarily',

		input: `
			function foo ( x ) {
				return function () {
					if ( true ) {
						const x = 'y';
						console.log( x );
					}
				};
			}`,

		output: `
			function foo ( x ) {
				return function () {
					if ( true ) {
						var x = 'y';
						console.log( x );
					}
				};
			}`
	},

	{
		description: 'deconflicts object pattern declarations',

		input: `
			let x;

			if ( true ) {
				let { x, y } = point;
				console.log( x );
			}`,

		output: `
			var x;

			if ( true ) {
				var x$1 = point.x;
				var y = point.y;
				console.log( x$1 );
			}`
	},

	{
		description: 'deconflicts array pattern declarations',

		input: `
			let x;

			if ( true ) {
				let [ x, y ] = point;
				console.log( x );
			}`,

		output: `
			var x;

			if ( true ) {
				var x$1 = point[0];
				var y = point[1];
				console.log( x$1 );
			}`
	},

	{
		description: 'deconflicts rest element declarations',

		input: `
			let x;

			if ( true ) {
				let [ first, second, ...x ] = y;
				console.log( x );
			}`,

		output: `
			var x;

			if ( true ) {
				var first = y[0];
				var second = y[1];
				var x$1 = y.slice(2);
				console.log( x$1 );
			}`
	},

	{
		description: 'can be disabled with `transforms.letConst: false`',
		options: { transforms: { letConst: false } },

		input: `
			let a = 1;

			if ( x ) {
				let a = 2;
				console.log( a );
			}

			console.log( a );`,

		output: `
			let a = 1;

			if ( x ) {
				let a = 2;
				console.log( a );
			}

			console.log( a );`
	},

	{
		description: 'reference preceding declaration (#87)',

		input: `
			if ( x ) {
				let a = function () { b(); };
				let b = function () { alert( 'hello' ); };

				a();
				b();
			}`,

		output: `
			if ( x ) {
				var a = function () { b(); };
				var b = function () { alert( 'hello' ); };

				a();
				b();
			}`
	},

	{
		description: 'correctly recognizes shadowing of const variables by mutable variables declared after mutation',

		input: `
			const bar = "FAIL";
			(function() {
					function foo() {
							--bar;
							bar = ["fail", "PASS", "Fail"][bar];
					}
					let bar = 2;
					foo();
					console.log(bar);
			}());
		`,

		output: `
			var bar = "FAIL";
			(function() {
					function foo() {
							--bar;
							bar = ["fail", "PASS", "Fail"][bar];
					}
					var bar = 2;
					foo();
					console.log(bar);
			}());
		`
	},

	{
		description: 'correctly transpiles if arrow functions are not transpiled',

		options: { transforms: { arrow: false } },

		input: `
			var c;
			if (true) {
				let c = prop.end;
				console.log(c);
			}`,

		output: `
			var c;
			if (true) {
				var c$1 = prop.end;
				console.log(c$1);
			}`,
	},

	{
		description: 'emits correct code after block-less if',

		input: 'if(0);const e=0',

		output: 'if(0){ ; }var e=0'
	},

	{
		description: 'properly replaces keys of renamed properties when conciseMethodProperty is false',
		options: { transforms: { letConst: true, conciseMethodProperty: false } },
		input: `
			const x = 1;
			if (true) {
				const x = 2;
				const y = { x };
			}
		`,
		output: `
			var x = 1;
			if (true) {
				var x$1 = 2;
				var y = { x: x$1 };
			}
		`
	},

	{
		description: 'properly replaces keys of renamed properties in destructuring when conciseMethodProperty is false',
		options: { transforms: { letConst: true, destructuring: false } },
		input: `
			const x = 1;
			if (true) {
				const y = {};
				const { x } = y;
			}
		`,
		output: `
			var x = 1;
			if (true) {
				var y = {};
				var { x: x$1 } = y;
			}
		`
	},

	{
		description: 'does not duplicate the key when removing shorthand properties',
		options: { transforms: { letConst: true } },
		input: `
			const x = 1;
			for (const x in { x }) {}
		`,
		output: `
			var x = 1;
			for (var x$1 in { x: x$1 }) {}
		`
	}
];
