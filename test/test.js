'use strict';

const expect = chai.expect;

function fetchUrl(url) {
  return $.ajax({
    url: url,
    dataType: 'json'
  });
}

describe('$.series', () => {
  it('series test', function () {
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
      return { name: 'i am pure function' };
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
    }], { name: 'initialValue' }).then((result) => {
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
    }, fetchUrl('defer3.json'), ['one', 'two']).then((v1, v2, v3, v4) => {
      expect(v1.name).to.equal('one');
      expect(v2.name).to.equal('two');
      expect(v3.name).to.equal('three');
      expect(v4).to.deep.equal(['one', 'two']);
    });
  })

  it('parallel single test', () => {
    return $.parallel(() => {
      return $.promisify(['one', 'two']);
    }).then((result) => {
      expect(result).to.deep.equal(['one', 'two']);
    })
  })

  it('parallel single ajax test', () => {
    return $.parallel(() => {
      return fetchUrl('defer1.json');
    }).then((result) => {
      expect(result.name).to.equal('one');
    })
  })
});

describe('$.promisify', () => {
  it('common value test', () => {
    return $.promisify('one').then((result) => {
      expect(result).to.equal('one');
    });
  });

  it('null value test', () => {
    return $.promisify(null).then((result) => {
      expect(result).to.equal(null);
    });
  });

  it('deferred value test', () => {
    return $.promisify(fetchUrl('defer1.json')).then((result) => {
      expect(result.name).to.equal('one');
    });
  });
});

describe('$.asyncEach', () => {
  it('asyncEach test', () => {
    return $.asyncEach(['defer1.json', 'defer2.json', 'defer3.json'], (url) => {
      return fetchUrl(url);
    }).then((result) => {
      expect(result[0].name).to.equal('one');
      expect(result[1].name).to.equal('two');
      expect(result[2].name).to.equal('three');
    });
  })
});

describe('$.polling', () => {
  it('polling test', (done) => {
    let count = 1;
    let polling = $.polling((step) => {
      count += step;
    }, 100, 2);

    polling.start();

    setTimeout(() => {
      expect(count).to.equal(3);

      setTimeout(() => {
        polling.stop();
        expect(count).to.equal(5);

        setTimeout(() => {
          expect(polling.times()).to.equal(2);
          expect(count).to.equal(5);
          done();
        }, 100);
      }, 110);
    }, 100);
  })

  it('polling async test', (done) => {
    let count = 1;
    let polling = $.polling((step) => fetchUrl('defer1.json').then(() => count += step), 100, 2);

    polling.start();

    setTimeout(() => {
      expect(count).to.equal(3);

      setTimeout(() => {
        polling.stop();
        expect(count).to.equal(5);

        setTimeout(() => {
          expect(polling.times()).to.equal(2);
          expect(count).to.equal(5);
          done();
        }, 100);
      }, 120);
    }, 120);
  })
})
