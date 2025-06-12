// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.104
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["总书记的“家园”之喻", "“最尴尬”的G7峰会要来了", "两个拍出天价的LABUBU都曾经是他的", "听听青年的网络文明“关键词”", "“张伟跪母”为何让我们泪流满面", "台网红“馆长”被投喂茶叶蛋榨菜", "特朗普回应马斯克道歉：非常好", "何小鹏：未来酒后可自动驾驶回家", "智能眼镜销量暴涨800%", "种粮大户的“丰收密码”", "744分考上清华的庞众望现状曝光", "男子造谣自己困电梯3小时被约谈", "台网红馆长：南浦大桥超级无敌霹雳长", "电梯厅抱压猥亵女子的头盔男被抓", "足协主席：我们在亚洲已经是三四流", "杰伦·布朗右膝手术后晒图报平安", "女生兼职给LABUBU钩衣服月入超2万", "阿里离职员工发万字长文 马云回应", "岳云鹏演唱会票价比凤凰传奇还贵", "曝名字都带yu的男女顶流曾在一起过", "央视主持人水均益回国 龙凤胎罕露面", "高考结束挑行李回家的女生发声", "台网红馆长喊话绿媒：被你们骗好苦", "上海海关截获濒危犀牛角126块", "美考虑废除与澳英的“奥库斯”协议", "保时捷纯电动卡宴破英国爬坡赛纪录", "部分港股通基金I类份额限购", "妈妈分享孩子高考前后伙食对比", "台湾网红馆长承认曾受影响骂过大陆", "俄国防部：俄远程轰炸机巡航波罗的海", "菲众议院确认对副总统弹劾指控合宪", "美官员称驻中东美军家属可自愿撤离", "美国洛杉矶市中心225人于10日晚被捕", "土耳其将向印尼出口48架第五代战机", "波兰政府通过议会信任投票", "人民日报记者独家对话张桂梅", "台网红“馆长”：藏海传在台湾火疯了", "开启智能辅助驾驶发生事故谁担责", "中方就涉缅甸问题表态", "白宫AI主管：中国模型落后美不到半年", "美媒：中国航母不久后或去夏威夷", "美国国民警卫队称已将拘留民众移交", "特朗普移民抗议活动蔓延至少24城", "美防长：向洛杉矶部署军队合法且合宪", "普京：新国家军备应关注核三位一体", "上海多个景区推出针对考生优惠政策", "亚洲区18强赛最终积分榜出炉", "美国5月消费者价格指数同比上涨", "迪士尼环球影业对AI公司提版权诉讼", "多只银行可转债触发强赎", "疆电千里入巴渝"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
