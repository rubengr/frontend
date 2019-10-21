/*
 * Copyright (C) 2019 OpenMotics BVBA
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import {inject, Factory, computedFrom} from 'aurelia-framework';
import {Toolbox} from '../../components/toolbox';
import {Step} from '../basewizard';
import {Logger} from '../../components/logger';
import {EventRule} from '../../containers/eventrule';

@inject(Factory.of(EventRule))
export class Configure extends Step {
    constructor(eventRuleFactory, ...rest /*, data */) {
        let data = rest.pop();
        super(...rest);
        this.eventRuleFactory = eventRuleFactory;
        this.title = this.i18n.tr('wizards.configureeventrule.title');
        this.data = data;
    }

    getTriggerText(trigger) {
        return `${trigger.name} (${trigger.id})`;
    }

    @computedFrom('data.title', 'data.message', 'data.trigger')
    get canProceed() {
        let valid = true, reasons = [], fields = new Set();
        const fieldRules = {
            title: {required: true, maxLength: 256},
            message: {required: true, maxLength: 2048},
            trigger: {required: true},
        };
        for (let [field, rules] of Object.entries(fieldRules)) {
            if (rules.required && !this.data[field]) {
                valid = false;
                reasons.push(this.i18n.tr(`wizards.configureeventrule.empty${field}`));
                fields.add(field);
            }
            if (rules.maxLength && this.data[field] && this.data[field].length > rules.maxLength) {
                valid = false;
                reasons.push(this.i18n.tr(`wizards.configureeventrule.toolong${field}`));
                fields.add(field);
            }
        }
        return {valid: valid, reasons: reasons, fields: fields};
    }

    async proceed() {
        const eventRule = this.data.eventRule || this.eventRuleFactory(undefined);
        eventRule.id = this.data.id;
        eventRule.title = this.data.title;
        eventRule.message = this.data.message;
        eventRule.target = this.data.target;
        eventRule.triggerType = this.data.triggerType;
        eventRule.triggerId = this.data.trigger.id;
        await eventRule.save();
        return eventRule;
    }

    async prepare() {
    }

    // Aurelia
    attached() {
        super.attached();
    }
}