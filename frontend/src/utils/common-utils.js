import config from "../config/config";

export class CommonUtils {
    static getLevelHtml(level) {
        let levelHtml = null;
        switch (level) {
            case config.freelancerLevels.junior:
                levelHtml = '<span class="badge badge-info">Junior</span>'
                break;
            case config.freelancerLevels.middle:
                levelHtml = '<span class="badge badge-warning">Middle</span>'
                break;
            case config.freelancerLevels.senior:
                levelHtml = '<span class="badge badge-success">Senior</span>'
                break;
            default:
                levelHtml = '<span class="badge badge-secondary">Unknown</span>'
        }

        return levelHtml;
    }

    static getStatusInfo(status) {
        const info = {
            name: '',
            color: '',
            icon: ''
        }

        switch (status) {
            case config.orderStatuses.new:
                info.name = 'Новый';
                info.color = 'secondary';
                info.icon = 'star';
                break;
            case config.orderStatuses.confirmed:
                info.name = 'Подтвержден';
                info.color = 'info';
                info.icon = 'eye';
                break;
            case config.orderStatuses.success:
                info.name = 'Выполнен';
                info.color = 'success';
                info.icon = 'check';
                break;
            case config.orderStatuses.canceled:
                info.name = 'Отменен';
                info.color = 'danger';
                info.icon = 'times';
                break;
            default:
                info.name = 'Неизвестно';
                info.color = 'secondary';
                info.icon = 'times';
        }

        return info;
    }

    static generateGridToolsColumn(entity, id) {
        return '<div class="' + entity + '-tools">' +
            '<a href="/' + entity + '/view?id=' + id + '" class="fas fa-eye"></a>' +
            '<a href="/' + entity + '/edit?id=' + id + '" class="fas fa-edit"></a>' +
            '<a href="/' + entity + '/delete?id=' + id + '" class="fas fa-trash"></a>' +
            '</div>';
    }
}