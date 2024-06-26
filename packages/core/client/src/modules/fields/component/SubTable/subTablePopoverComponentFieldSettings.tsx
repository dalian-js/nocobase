import { Field } from '@formily/core';
import { useField, useFieldSchema, ISchema } from '@formily/react';
import { useTranslation } from 'react-i18next';
import { ArrayItems } from '@formily/antd-v5';
import { SchemaSettings } from '../../../../application/schema-settings/SchemaSettings';
import { useFieldComponentName } from '../../../../common/useFieldComponentName';
import {
  useDesignable,
  useFieldModeOptions,
  useIsAddNewForm,
  useIsFieldReadPretty,
} from '../../../../schema-component';
import { isSubMode } from '../../../../schema-component/antd/association-field/util';
import { useCollectionManager_deprecated, useSortFields } from '../../../../collection-manager';

const fieldComponent: any = {
  name: 'fieldComponent',
  type: 'select',
  useComponentProps() {
    const { t } = useTranslation();
    const field = useField<Field>();
    const fieldSchema = useFieldSchema();
    const fieldModeOptions = useFieldModeOptions();
    const isAddNewForm = useIsAddNewForm();
    const fieldComponentName = useFieldComponentName();
    const { dn } = useDesignable();

    return {
      title: t('Field component'),
      options: fieldModeOptions,
      value: fieldComponentName,
      onChange(mode) {
        const schema = {
          ['x-uid']: fieldSchema['x-uid'],
        };
        fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
        fieldSchema['x-component-props']['mode'] = mode;
        schema['x-component-props'] = fieldSchema['x-component-props'];
        field.componentProps = field.componentProps || {};
        field.componentProps.mode = mode;

        // 子表单状态不允许设置默认值
        if (isSubMode(fieldSchema) && isAddNewForm) {
          // @ts-ignore
          schema.default = null;
          fieldSchema.default = null;
          field.setInitialValue(null);
          field.setValue(null);
        }

        void dn.emit('patch', {
          schema,
        });
        dn.refresh();
      },
    };
  },
};
const allowSelectExistingRecord = {
  name: 'allowSelectExistingRecord',
  type: 'switch',
  useVisible() {
    const readPretty = useIsFieldReadPretty();
    return !readPretty;
  },
  useComponentProps() {
    const { t } = useTranslation();
    const field = useField<Field>();
    const fieldSchema = useFieldSchema();
    const { dn, refresh } = useDesignable();
    return {
      title: t('Allow selection of existing records'),
      checked: fieldSchema['x-component-props']?.allowSelectExistingRecord,
      onChange(value) {
        const schema = {
          ['x-uid']: fieldSchema['x-uid'],
        };
        field.componentProps.allowSelectExistingRecord = value;
        fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
        fieldSchema['x-component-props'].allowSelectExistingRecord = value;
        schema['x-component-props'] = fieldSchema['x-component-props'];
        dn.emit('patch', {
          schema,
        });
        refresh();
      },
    };
  },
};

export const setDefaultSortingRules = {
  name: 'SetDefaultSortingRules',
  type: 'modal',
  useComponentProps() {
    const { getCollectionJoinField } = useCollectionManager_deprecated();
    const field = useField();
    const fieldSchema = useFieldSchema();
    const association = fieldSchema['x-collection-field'];
    const { target } = getCollectionJoinField(association) || {};
    const sortFields = useSortFields(target);
    const { t } = useTranslation();
    const { dn } = useDesignable();
    const defaultSort = field.componentProps.sortArr || [];
    const sort = defaultSort?.map((item: string) => {
      return item?.startsWith('-')
        ? {
            field: item.substring(1),
            direction: 'desc',
          }
        : {
            field: item,
            direction: 'asc',
          };
    });

    return {
      title: t('Set default sorting rules'),
      components: { ArrayItems },
      schema: {
        type: 'object',
        title: t('Set default sorting rules'),
        properties: {
          sort: {
            type: 'array',
            default: sort,
            'x-component': 'ArrayItems',
            'x-decorator': 'FormItem',
            items: {
              type: 'object',
              properties: {
                space: {
                  type: 'void',
                  'x-component': 'Space',
                  properties: {
                    sort: {
                      type: 'void',
                      'x-decorator': 'FormItem',
                      'x-component': 'ArrayItems.SortHandle',
                    },
                    field: {
                      type: 'string',
                      enum: sortFields,
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-component-props': {
                        style: {
                          width: 260,
                        },
                      },
                    },
                    direction: {
                      type: 'string',
                      'x-decorator': 'FormItem',
                      'x-component': 'Radio.Group',
                      'x-component-props': {
                        optionType: 'button',
                      },
                      enum: [
                        {
                          label: t('ASC'),
                          value: 'asc',
                        },
                        {
                          label: t('DESC'),
                          value: 'desc',
                        },
                      ],
                    },
                    remove: {
                      type: 'void',
                      'x-decorator': 'FormItem',
                      'x-component': 'ArrayItems.Remove',
                    },
                  },
                },
              },
            },
            properties: {
              add: {
                type: 'void',
                title: t('Add sort field'),
                'x-component': 'ArrayItems.Addition',
              },
            },
          },
        },
      } as ISchema,
      onSubmit: ({ sort }) => {
        const sortArr = sort.map((item) => {
          return item.direction === 'desc' ? `-${item.field}` : item.field;
        });
        field.componentProps.sortArr = sortArr;
        fieldSchema['x-component-props'].sortArr = sortArr;
        dn.emit('patch', {
          schema: {
            ['x-uid']: fieldSchema['x-uid'],
            'x-component-props': fieldSchema['x-component-props'],
          },
        });
      },
    };
  },
  useVisible() {
    const { getCollectionJoinField } = useCollectionManager_deprecated();
    const fieldSchema = useFieldSchema();
    const association = fieldSchema['x-collection-field'];
    const { interface: targetInterface } = getCollectionJoinField(association) || {};
    const readPretty = useIsFieldReadPretty();
    return readPretty && ['m2m', 'o2m'].includes(targetInterface);
  },
};
export const subTablePopoverComponentFieldSettings = new SchemaSettings({
  name: 'fieldSettings:component:SubTable',
  items: [fieldComponent, allowSelectExistingRecord, setDefaultSortingRules],
});
