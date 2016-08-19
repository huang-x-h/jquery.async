'use strict';

const expect = chai.expect;

function fetchUrl(url) {
  return $.ajax({
    url: url,
    dataType: 'json'
  });
}

describe('$.series', () => {
  it('series test', function() {
    return $.series(() => {
      return fetchUrl('defer1.json');
    }, (result) => {
      expect(result.name).to.equal('one');
      return fetchUrl('defer2.json');
    }, (result) => {
      expect(result.name).to.equal('two');
      return fetchUrl('defer3.json');
    }).then((result) => {
      expect(result.name).to.equal('three');
    });
  });

  it('series pure function test', () => {
    return $.series(() => {
      return fetchUrl('defer1.json');
    }, (result) => {
      expect(result.name).to.equal('one');
      return {name: 'i am pure function'};
    }, (result) => {
      expect(result.name).to.equal('i am pure function');
      return fetchUrl('defer2.json');
    }).then((result) => {
      expect(result.name).to.equal('two');
    });
  });

  it('series initialValue test', () => {
    return $.series([(result) => {
      expect(result.name).to.equal('initialValue');
      return fetchUrl('defer1.json');
    }, (result) => {
      expect(result.name).to.equal('one');
      return fetchUrl('defer2.json');
    }], {name: 'initialValue'}).then((result) => {
      expect(result.name).to.equal('two');
    });
  });
});

describe('$.parallel', () => {
  it('parallel test', () => {
    return $.parallel(() => {
      return fetchUrl('defer1.json');
    }, () => {
      return fetchUrl('defer2.json');
    }, () => {
      return fetchUrl('defer3.json');
    }).then((result) => {
      expect(result[0].name).to.equal('one');
      expect(result[1].name).to.equal('two');
      expect(result[2].name).to.equal('three');
    });
  })
});
