describe('hx-swap-oob attribute', function() {
  beforeEach(function() {
    this.server = makeServer()
    clearWorkArea()
  })
  afterEach(function() {
    this.server.restore()
    clearWorkArea()
  })

  it('handles basic response properly', function() {
    this.server.respondWith('GET', '/test', "Clicked<div id='d1' hx-swap-oob='true'>Swapped0</div>")
    var div = make('<div hx-get="/test">click me</div>')
    make('<div id="d1"></div>')
    div.click()
    this.server.respond()
    div.innerHTML.should.equal('Clicked')
    byId('d1').innerHTML.should.equal('Swapped0')
  })

  it('handles more than one oob swap properly', function() {
    this.server.respondWith('GET', '/test', "Clicked<div id='d1' hx-swap-oob='true'>Swapped1</div><div id='d2' hx-swap-oob='true'>Swapped2</div>")
    var div = make('<div hx-get="/test">click me</div>')
    make('<div id="d1"></div>')
    make('<div id="d2"></div>')
    div.click()
    this.server.respond()
    div.innerHTML.should.equal('Clicked')
    byId('d1').innerHTML.should.equal('Swapped1')
    byId('d2').innerHTML.should.equal('Swapped2')
  })

  it('handles no id match properly', function() {
    this.server.respondWith('GET', '/test', "Clicked<div id='d1' hx-swap-oob='true'>Swapped2</div>")
    var div = make('<div hx-get="/test">click me</div>')
    div.click()
    this.server.respond()
    div.innerText.should.equal('Clicked')
  })

  it('handles basic response properly w/ data-* prefix', function() {
    this.server.respondWith('GET', '/test', "Clicked<div id='d1' data-hx-swap-oob='true'>Swapped3</div>")
    var div = make('<div data-hx-get="/test">click me</div>')
    make('<div id="d1"></div>')
    div.click()
    this.server.respond()
    div.innerHTML.should.equal('Clicked')
    byId('d1').innerHTML.should.equal('Swapped3')
  })

  it('handles outerHTML response properly', function() {
    this.server.respondWith('GET', '/test', "Clicked<div id='d1' foo='bar' hx-swap-oob='outerHTML'>Swapped4</div>")
    var div = make('<div hx-get="/test">click me</div>')
    make('<div id="d1"></div>')
    div.click()
    this.server.respond()
    byId('d1').getAttribute('foo').should.equal('bar')
    div.innerHTML.should.equal('Clicked')
    byId('d1').innerHTML.should.equal('Swapped4')
  })

  it('handles innerHTML response properly', function() {
    this.server.respondWith('GET', '/test', "Clicked<div id='d1' foo='bar' hx-swap-oob='innerHTML'>Swapped5</div>")
    var div = make('<div hx-get="/test">click me</div>')
    make('<div id="d1"></div>')
    div.click()
    this.server.respond()
    should.equal(byId('d1').getAttribute('foo'), null)
    div.innerHTML.should.equal('Clicked')
    byId('d1').innerHTML.should.equal('Swapped5')
  })

  it('oob swaps can be nested in content', function() {
    this.server.respondWith('GET', '/test', "<div>Clicked<div id='d1' foo='bar' hx-swap-oob='innerHTML'>Swapped6</div></div>")
    var div = make('<div hx-get="/test">click me</div>')
    make('<div id="d1"></div>')
    div.click()
    this.server.respond()
    should.equal(byId('d1').getAttribute('foo'), null)
    div.innerHTML.should.equal('<div>Clicked</div>')
    byId('d1').innerHTML.should.equal('Swapped6')
  })

  it('oob swaps can use selectors to match up', function() {
    this.server.respondWith('GET', '/test', "<div>Clicked<div hx-swap-oob='innerHTML:[oob-foo]'>Swapped7</div></div>")
    var div = make('<div hx-get="/test">click me</div>')
    make('<div id="d1" oob-foo="bar"></div>')
    div.click()
    this.server.respond()
    should.equal(byId('d1').getAttribute('oob-foo'), 'bar')
    div.innerHTML.should.equal('<div>Clicked</div>')
    byId('d1').innerHTML.should.equal('Swapped7')
  })

  it('swaps into all targets that match the selector (innerHTML)', function() {
    this.server.respondWith('GET', '/test', "<div>Clicked</div><div class='target' hx-swap-oob='innerHTML:.target'>Swapped8</div>")
    var div = make('<div hx-get="/test">click me</div>')
    make('<div id="d1">No swap</div>')
    make('<div id="d2" class="target">Not swapped</div>')
    make('<div id="d3" class="target">Not swapped</div>')
    div.click()
    this.server.respond()
    byId('d1').innerHTML.should.equal('No swap')
    byId('d2').innerHTML.should.equal('Swapped8')
    byId('d3').innerHTML.should.equal('Swapped8')
  })

  it('swaps into all targets that match the selector (outerHTML)', function() {
    var oobSwapContent = '<div class="new-target" hx-swap-oob="outerHTML:.target">Swapped9</div>'
    this.server.respondWith('GET', '/test', '<div>Clicked</div>' + oobSwapContent)
    var div = make('<div hx-get="/test">click me</div>')
    make('<div id="d1"><div>No swap</div></div>')
    make('<div id="d2"><div class="target">Not swapped</div></div>')
    make('<div id="d3"><div class="target">Not swapped</div></div>')
    div.click()
    this.server.respond()
    byId('d1').innerHTML.should.equal('<div>No swap</div>')
    byId('d2').innerHTML.should.equal(oobSwapContent)
    byId('d3').innerHTML.should.equal(oobSwapContent)
  })

  it('oob swap delete works properly', function() {
    this.server.respondWith('GET', '/test', '<div hx-swap-oob="delete" id="d1"></div>')

    var div = make('<div id="d1" hx-get="/test">Foo</div>')
    div.click()
    this.server.respond()
    should.equal(byId('d1'), null)
  })

  it('oob swap supports table row in fragment along other oob swap elements', function() {
    this.server.respondWith('GET', '/test',
      `Clicked
      <div hx-swap-oob="innerHTML" id="d1">Test</div>
      <button type="button" hx-swap-oob="true" id="b2">Another button</button>
      <template>
        <tr hx-swap-oob="true" id="r1"><td>bar</td></tr>
      </template>
      <template>
        <td hx-swap-oob="true" id="td1">hey</td>
      </template>`)

    make(`<div id="d1">Bar</div>
      <button id="b2">Foo</button>
      <table id="table">
        <tbody id="tbody">
          <tr id="r1">
           <td>foo</td>
          </tr>
          <tr>
            <td id="td1">Bar</td>
          </tr>
        </tbody>
      </table>`)

    var btn = make('<button id="b1" type="button" hx-get="/test">Click me</button>')
    btn.click()
    this.server.respond()
    btn.innerText.should.equal('Clicked')
    byId('r1').innerHTML.should.equal('<td>bar</td>')
    byId('b2').innerHTML.should.equal('Another button')
    byId('d1').innerHTML.should.equal('Test')
    byId('td1').innerHTML.should.equal('hey')
  })

  it('oob swap works with a swap delay', function(done) {
    this.server.respondWith('GET', '/test', "<div id='d2' hx-swap-oob='innerHTML swap:10ms'>Clicked!</div>")
    var div = make("<div id='d1' hx-get='/test'></div>")
    var div2 = make("<div id='d2'></div>")
    div.click()
    this.server.respond()
    div2.innerText.should.equal('')
    setTimeout(function() {
      div2.innerText.should.equal('Clicked!')
      done()
    }, 30)
  })

  it('oob swap works with a settle delay', function(done) {
    this.server.respondWith('GET', '/test', "<div id='d2' class='foo' hx-swap-oob='true settle:10ms'>Clicked!</div>")
    var div = make("<div id='d1' hx-get='/test'></div>")
    var div2 = make("<div id='d2'></div>")
    div.click()
    this.server.respond()
    div2.classList.contains('foo').should.equal(false)
    setTimeout(function() {
      byId('d2').classList.contains('foo').should.equal(true)
      done()
    }, 30)
  })
})
