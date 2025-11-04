// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.394
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
var default_search_words = ["习主席的韩国APEC时间", "金永南逝世朝鲜举行国葬 金正恩吊唁", "战国漆器图案与人民币纹样高度相似", "9组数字速览第八届进博会", "儿时的公益广告照进现实", "何炅回应衰老焦虑：准备再干三四十年", "340斤男生展示8块腹肌走红", "收纳团队90%是宝妈 月入过万还自由", "卫星图揭美军舰载机南海坠毁真相", "北方迎强降雪 局地大暴雪特大暴雪", "虚拟主播上央视也得素颜", "新疆天山大峡谷景区塌方系谣言", "全红婵帮谢思埸带娃秒变“红姨”", "特朗普70分钟采访提及中国41次", "男子15年内6结6离 5任前妻都成债主", "“一觉醒来 导航都变了”", "别因一根淀粉肠背离教育初心", "印航空难唯一幸存者无法与妻儿说话", "11岁抗癌博主“婷婷打怪兽”离世", "宋朝华被开除党籍：对抗组织审查", "扶贫老书记去世 工资卡余额38.83元", "搞权色钱色交易 钟恒钦被决定逮捕", "26元深夜上门开锁被收1300 商家回应", "饿了么内测版本更名为“淘宝闪购”", "中国航天员在太空烤鸡翅", "遭吐槽“阿里味”越来越重 山姆回应", "秘鲁决定与墨西哥断绝外交关系", "河南学生党的深夜食堂3元就管饱", "102岁女科学家萨本茂逝世", "要6位数通告费被封杀？蒲熠星回应", "河南省军区原司令员朱超逝世", "女子回应获美甲比赛冠军奖金15万元", "高校回应招保卫工作岗要求硕士学历", "用户吐槽山姆变得像盒马", "台湾嘉义一营区发生逃兵事件", "东南海域00后飞行员首次实弹射击", "今年个头最大“超级月亮”即将上线", "JDG经理疑曝Kanavi态度有问题", "委内瑞拉面对美军进逼亮出俄制武器", "台湾不能再吃战争的苦", "俄称乌军已致库尔斯克州近2000人伤亡", "美或因政府“停摆”关闭空域", "马斯克称若发现外星人证据就公开", "境外间谍以兼职为名拉拢中国青年", "17岁男生帮网诈团伙打电话获刑8个月", "有中国游客在马尔代夫浮潜时溺亡", "转岗7个月即被免职 朱东亚主动投案", "哈梅内伊向美开出三大条件", "安德鲁仅剩的荣誉军衔将被剥夺", "上海一消费者称花91元买一根甘蔗", "郑丽文：要终结两岸自相残杀的悲剧"]

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
