/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'vault/tests/helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { GENERAL } from 'vault/tests/helpers/general-selectors';
import codemirror from 'vault/tests/helpers/codemirror';
import { TOOLS_SELECTORS as TS } from 'vault/tests/helpers/tools-selectors';

module('Integration | Component | tools/tool-wrap', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.codemirrorUpdated = sinon.spy();
    this.onBack = sinon.spy();
    this.onClear = sinon.spy();
    this.updateTtl = sinon.spy();
    this.buttonDisabled = true;
    this.data = '{\n}';
    this.renderComponent = async () => {
      await render(hbs`
    <ToolWrap
      @token={{this.token}}
      @buttonDisabled={{this.buttonDisabled}}
      @errors={{this.errors}}
      @onClear={{this.onClear}}
      @onBack={{this.onBack}}
      @codemirrorUpdated={{this.codemirrorUpdated}}
      @updateTtl={{this.updateTtl}}
      @data={{this.data}}
    />`);
    };
  });

  test('it renders defaults', async function (assert) {
    await this.renderComponent();

    assert.dom('h1').hasText('Wrap Data', 'Title renders');
    assert.strictEqual(codemirror().getValue(' '), '{ }', 'json editor initializes with empty object');
    assert.dom(GENERAL.toggleInput('Wrap TTL')).isNotChecked('Wrap TTL defaults to unchecked');
    assert.dom(TS.submit).isDisabled();
    assert.dom(TS.toolsInput('wrapping-token')).doesNotExist();
    assert.dom(TS.button('Back')).doesNotExist();
    assert.dom(TS.button('Done')).doesNotExist();
  });

  test('it renders token view', async function (assert) {
    this.token = 'blah.jhfel7SmsVeZwihaGiIKHGh2cy5XZWtEeEt5WmRwS1VYSTNDb1BBVUNsVFAQ3JIK';
    await this.renderComponent();

    assert.dom('h1').hasText('Wrap Data');
    assert.dom('label').hasText('Wrapped token');
    assert.dom('.CodeMirror').doesNotExist();
    assert.dom(TS.toolsInput('wrapping-token')).hasText(this.token);
    await click(TS.button('Back'));
    assert.true(this.onBack.calledOnce, 'onBack is called');
    await click(TS.button('Done'));
    assert.true(this.onClear.calledOnce, 'onClear is called');
  });

  test('it fires callback actions', async function (assert) {
    this.buttonDisabled = false;
    const data = `{"foo": "bar"}`;
    await this.renderComponent();
    await codemirror().setValue(data);
    await click(GENERAL.toggleInput('Wrap TTL'));
    await fillIn(GENERAL.ttl.input('Wrap TTL'), '20');

    assert.propEqual(this.codemirrorUpdated.lastCall.args, [data, false], 'codemirrorUpdated is called');
    assert.propEqual(this.updateTtl.lastCall.args, ['1200s'], 'updateTtl is called');
  });
});
